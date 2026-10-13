type ChatHistoryItem = {
  role: 'user' | 'assistant';
  text: string;
};

type ChatRequestBody = {
  message?: unknown;
  history?: unknown;
};

type WorkerEnv = {
  GEMINI_API_KEY: string;
  RATE_LIMIT_KV?: {
    get(key: string): Promise<string | null>;
    put(
      key: string,
      value: string,
      options?: {
        expirationTtl?: number;
      },
    ): Promise<void>;
  };
};

const ALLOWED_ORIGINS = new Set([
  'https://kafuicharbeleklu.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
// The assistant only knows what is written here: it must not invent anything about Charbel.
const SYSTEM_PROMPT = [
  "Tu es l'assistant du portfolio de Kafui Charbel Eklu. Reponds de maniere professionnelle, concise, utile, en francais par defaut (en anglais si la question est en anglais).",
  'Faits sur Charbel, seule source autorisee :',
  '- Technicien informatique chez Neemba Togo (concessionnaire Caterpillar present dans 11 pays), a Lome, depuis mai 2023. Perimetre : Active Directory et droits d acces, reseau local, liaisons Internet et salle serveur, budget IT annuel et fournisseurs, reporting Power BI, relais infrastructure aupres de la DSI groupe (Cote d Ivoire, Senegal), encadrement d une stagiaire, support N2/N3.',
  '- Realisations : projet de stage academique chez Neemba Togo sur le deploiement d un SIEM/XDR Wazuh avec reponses automatiques (ce n est pas une tache quotidienne du poste actuel) ; portabilite de la flotte mobile Moov vers Togocom ; applications internes Tracker (suivi du parc IT) et PrintTrack (consommables d impression) ; SmartProcure (extraction de devis avec l IA, projet personnel) ; flux Power Automate qui recupere les rapports de sauvegarde Veeam et consolide les indicateurs dans Excel ; tableaux de bord Power BI : IT des filiales du groupe (2025), licences et comptes Microsoft 365 (2026), RH du groupe (2026), fiscalite de Neemba Guinee (2026), formation Neemba Academy avec SharePoint (2026) ; outil Python Neemba Reports (rapports logistiques, 2026) ; registre des immobilisations SYSCOHADA pour la Clinique BIASA (2026) ; guides techniques (serveur LDAP sous Ubuntu, MFA sur Ubuntu, PostgreSQL en SSL/TLS) ; travaux pratiques (API Python Flask/FastAPI, Nextcloud, serveur de messagerie Postfix/Dovecot, pare-feu pfSense, serveur IRC, OpenVPN avec MFA).',
  '- Stages : Neemba Togo (projet academique Wazuh SIEM/XDR, distinct des taches quotidiennes) ; Orabank Togo (2022, controleur de domaine Windows Server, VPN, Western Union, MoneyGram, RIA) ; Clinique BIASA (2021, services reseau Ubuntu).',
  '- Formation : Master professionnel Reseaux et Systemes d Information, mention Bien (College de Paris Superieur, Lome, 2023-2025), memoire sur l integration d un modele d IA dans un SIEM ; titre de Manager Operationnel d Activites (Ascencia, 2025) evalue equivalent Master par WES (Canada, 2026) ; Ingenieur des Travaux Informatiques (IAI-Togo, 2020-2023, mention Assez Bien).',
  '- Competences : cybersecurite (Wazuh, pare-feu, Veeam, ISO 27001, EBIOS, MEHARI), systemes (Windows Server, Linux, VMware ESXi, Hyper-V), reseaux (LAN, VPN, VSAT, GNS3, EVE-NG), cloud (Azure, Microsoft 365, notions AWS), automatisation et IA (Bash, PowerShell, Python, Power Automate, agents de developpement), pilotage (budget IT, infogerance, Matrix42, Power BI, COBIT, CAPM).',
  '- Langues : francais C2 a l oral (TEF Canada 2026), anglais B2. Base : Lome, Togo, mobilite internationale. Cap : gouvernance et securite des systemes d information.',
  '- Contact : charbelkafuieklu@gmail.com, LinkedIn kafui-charbel-eklu, GitHub kafuicharbeleklu.',
  'Si une question sort de ces faits (vie privee, chiffres, avis), dis que tu ne sais pas et renvoie vers l email. Ne cite jamais de montant financier.',
].join('\n');
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_MESSAGE = 'Limite de messages atteinte, réessayez plus tard.';
const memoryRateLimit = new Map<string, { count: number; expiresAt: number }>();

const jsonResponse = (payload: Record<string, unknown>, status: number, origin: string | null) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      Vary: 'Origin',
    },
  });

const isChatHistoryItem = (value: unknown): value is ChatHistoryItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.text === 'string'
  );
};

const toGeminiContents = (history: ChatHistoryItem[], message: string) => [
  ...history
    .filter((item) => item.text.trim())
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text.trim() }],
    })),
  {
    role: 'user',
    parts: [{ text: message }],
  },
];

const getClientIp = (request: Request) => {
  const cfIp = request.headers.get('CF-Connecting-IP')?.trim();
  if (cfIp) {
    return cfIp;
  }

  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'anonymous';
  }

  return 'anonymous';
};

const getRateLimitKey = (ip: string, now: number) =>
  `chat-rate:${ip}:${Math.floor(now / (RATE_LIMIT_WINDOW_SECONDS * 1000))}`;

const incrementRateLimit = async (env: WorkerEnv, request: Request) => {
  const now = Date.now();
  const key = getRateLimitKey(getClientIp(request), now);

  if (env.RATE_LIMIT_KV) {
    const current = Number((await env.RATE_LIMIT_KV.get(key)) || '0');
    if (current >= RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    await env.RATE_LIMIT_KV.put(key, String(current + 1), {
      expirationTtl: RATE_LIMIT_WINDOW_SECONDS + 60,
    });
    return true;
  }

  const current = memoryRateLimit.get(key);
  if (!current || current.expiresAt <= now) {
    memoryRateLimit.set(key, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
};

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return jsonResponse({}, 204, origin);
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse({ error: 'Origin not allowed.' }, 403, origin);
    }

    if (url.pathname !== '/api/chat') {
      return jsonResponse({ error: 'Not found.' }, 404, origin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'Missing GEMINI_API_KEY secret.' }, 500, origin);
    }

    const isWithinLimit = await incrementRateLimit(env, request);
    if (!isWithinLimit) {
      return jsonResponse({ error: RATE_LIMIT_MESSAGE }, 429, origin);
    }

    let body: ChatRequestBody;
    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400, origin);
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body.history) ? body.history.filter(isChatHistoryItem) : [];

    if (!message) {
      return jsonResponse({ error: 'Message is required.' }, 400, origin);
    }

    try {
      const geminiResponse = await fetch(
        `${GEMINI_ENDPOINT}?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: toGeminiContents(history, message),
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 400,
            },
          }),
        },
      );

      const payload = (await geminiResponse.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
        error?: {
          message?: string;
        };
      };

      if (!geminiResponse.ok) {
        return jsonResponse(
          {
            error: payload.error?.message || 'Gemini request failed.',
          },
          geminiResponse.status,
          origin,
        );
      }

      const reply =
        payload.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || '')
          .join('')
          .trim() || '';

      if (!reply) {
        return jsonResponse({ error: 'Empty Gemini response.' }, 502, origin);
      }

      return jsonResponse({ reply }, 200, origin);
    } catch {
      return jsonResponse({ error: 'Unable to reach Gemini from the worker.' }, 502, origin);
    }
  },
};
