/**
 * The companion of the "En bref" drawer: a small paper character drawn on canvas, in the manner
 * of the notch companions. A soft superellipse body, a face that slides across it to look around,
 * eyes that change shape to show a mood, squash and stretch when he jumps. Framework-free: the
 * drawer owns the frame loop and the pointer, and calls `step` then `draw` every frame.
 */

export type EyeShape = 'pill' | 'wide' | 'happy' | 'closed' | 'spiral' | 'wink';

type Prop = 'yaw' | 'pitch' | 'roll' | 'sx' | 'sy' | 'oy' | 'open' | 'es' | 'tint' | 'hands';
type Ease = (t: number) => number;
type Key = [target: number, duration: number, ease: Ease];
type Tween = { keys: Key[]; index: number; from: number; start: number; done?: () => void };
type Particle = {
  type: 'star' | 'z';
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  rot: number;
  spin: number;
  size: number;
  honey: boolean;
};
type Target = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; dpr: number };
type RGB = readonly [number, number, number];

export type CompanionOptions = {
  /** half-width of the body, in CSS pixels */
  R?: number;
  w?: number;
  h?: number;
  /** horizontal centre of the body in the canvas */
  cx?: number;
  /** bottom of the body in the canvas: the point he stands on */
  baseY?: number;
  reduced?: boolean;
};

/** The canvas of the drawer companion: room on the left for a waving hand and the stars. */
export const COMPANION_CANVAS = { R: 42, w: 150, h: 180, cx: 94, baseY: 136 } as const;
/** Where his body centre sits in that canvas, to measure the distance to the pointer. */
export const COMPANION_CENTRE = {
  x: COMPANION_CANVAS.cx,
  y: COMPANION_CANVAS.baseY - COMPANION_CANVAS.R * 0.8,
} as const;

const EASE = {
  linear: (t: number) => t,
  in: (t: number) => t * t * t,
  out: (t: number) => 1 - (1 - t) ** 3,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  back: (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
} satisfies Record<string, Ease>;

// The paper of the site's cards, its honey, its ink: constant in both themes, like the drawer.
const PAPER_TOP: RGB = [250, 246, 238];
const PAPER_BOTTOM: RGB = [219, 206, 184];
const HONEY: RGB = [185, 138, 62];
const INK: RGB = [38, 39, 42];
const SEGMENTS = 72;
/** superellipse exponent 2.7, the soft "mochi" outline */
const EXPONENT = 2 / 2.7;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const rgba = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

export class Companion {
  readonly R: number;
  readonly W: number;
  readonly H: number;
  readonly cx: number;
  readonly baseY: number;
  reduced: boolean;

  /** what he aims for: the face turns toward `yaw`/`pitch`, the body leans by `roll` */
  readonly tg = { yaw: 0, pitch: 0, roll: 0 };
  sleeping = false;

  private readonly s: Record<Prop, number> = {
    yaw: 0,
    pitch: 0,
    roll: 0,
    sx: 1,
    sy: 1,
    oy: 0,
    open: 1,
    es: 1,
    tint: 0,
    hands: 0,
  };
  private targets: Target[] = [];
  private baseEye: EyeShape = 'pill';
  private eye: EyeShape = 'pill';
  private holdUntil = 0;
  private morphing = false;
  private pending: EyeShape | null = null;
  private readonly tweens = new Map<Prop, Tween>();
  private particles: Particle[] = [];
  private readonly t0 = performance.now() - Math.random() * 4000;
  private nextBlink = performance.now() + 1500 + Math.random() * 3000;
  private nextZ = 0;
  private wobbleUntil = 0;
  private waveUntil = 0;
  private last = performance.now();

  constructor({
    R = COMPANION_CANVAS.R,
    w = COMPANION_CANVAS.w,
    h = COMPANION_CANVAS.h,
    cx = COMPANION_CANVAS.cx,
    baseY = COMPANION_CANVAS.baseY,
    reduced = false,
  }: CompanionOptions = {}) {
    this.R = R;
    this.W = w;
    this.H = h;
    this.cx = cx;
    this.baseY = baseY;
    this.reduced = reduced;
  }

  /** He can be drawn on several canvases at once: the tab, and the open drawer. */
  attach(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx || this.targets.some((target) => target.canvas === canvas)) {
      return;
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(this.W * dpr);
    canvas.height = Math.round(this.H * dpr);
    this.targets.push({ canvas, ctx, dpr });
  }

  detach(canvas: HTMLCanvasElement) {
    this.targets = this.targets.filter((target) => target.canvas !== canvas);
  }

  // ---------- moods ----------

  /** the eyes at rest: `pill`, or `wide` when someone is near */
  setBase(shape: EyeShape) {
    this.baseEye = shape;
    if (performance.now() > this.holdUntil) {
      this.morphEye(shape);
    }
  }

  /** a passing expression, held for `hold` ms (Infinity keeps it) */
  show(shape: EyeShape, hold: number) {
    this.holdUntil = hold === Infinity ? Infinity : performance.now() + hold;
    this.morphEye(shape);
  }

  /** the jump that opens the drawer: squash, stretch, happy eyes, a puff of stars */
  hop() {
    this.show('happy', 1300);
    this.tween('tint', [
      [0.4, 180, EASE.out],
      [0, 1500, EASE.inOut],
    ]);
    if (this.reduced) {
      return;
    }
    this.tween('sy', [
      [1.22, 110, EASE.out],
      [0.82, 150, EASE.inOut],
      [1.06, 160, EASE.out],
      [1, 160, EASE.out],
    ]);
    this.tween('sx', [
      [0.86, 110, EASE.out],
      [1.16, 150, EASE.inOut],
      [0.97, 160, EASE.out],
      [1, 160, EASE.out],
    ]);
    this.tween('oy', [
      [-24, 260, EASE.out],
      [0, 230, EASE.in],
    ]);
    this.burst(6);
  }

  /** hello: paper hands come out, the left one waves */
  wave() {
    this.show('happy', 1600);
    if (this.reduced) {
      return;
    }
    this.waveUntil = performance.now() + 1500;
    this.tween('hands', [
      [1, 260, EASE.back],
      [1, 1200, EASE.linear],
      [0, 320, EASE.in],
    ]);
  }

  /** three quick pokes: spiral eyes and a stagger */
  dizzy() {
    this.show('spiral', 1700);
    this.tween('tint', [
      [0.5, 150, EASE.out],
      [0, 1700, EASE.inOut],
    ]);
    if (!this.reduced) {
      this.wobbleUntil = performance.now() + 1700;
    }
  }

  wink() {
    this.show('wink', 900);
  }

  sleep() {
    if (this.sleeping) {
      return;
    }
    this.sleeping = true;
    this.show('closed', Infinity);
    this.tg.roll = 0.1;
  }

  wake() {
    if (!this.sleeping) {
      return;
    }
    this.sleeping = false;
    this.holdUntil = 0;
    this.morphEye(this.baseEye);
    this.tg.roll = 0;
    if (!this.reduced) {
      this.tween('sy', [
        [1.1, 150, EASE.out],
        [1, 260, EASE.out],
      ]);
    }
  }

  // ---------- the clock ----------

  step(now: number) {
    const dt = Math.min(50, now - this.last);
    this.last = now;

    for (const [prop, tween] of [...this.tweens]) {
      const key = tween.keys[tween.index];
      if (!key) {
        this.tweens.delete(prop);
        continue;
      }
      const [target, duration, ease] = key;
      const progress = duration > 0 ? Math.min(1, (now - tween.start) / duration) : 1;
      this.s[prop] = tween.from + (target - tween.from) * ease(progress);
      if (progress >= 1) {
        tween.index += 1;
        tween.from = target;
        tween.start = now;
        if (tween.index >= tween.keys.length) {
          this.tweens.delete(prop);
          tween.done?.();
        }
      }
    }

    const { s, tg } = this;
    s.yaw += (tg.yaw - s.yaw) * 0.12;
    s.pitch += (tg.pitch - s.pitch) * 0.12;
    s.roll += (tg.roll - s.roll) * 0.1;

    if (!this.sleeping && now > this.nextBlink) {
      this.blink();
      this.nextBlink = now + 2200 + Math.random() * 3800;
    }
    if (
      this.holdUntil !== Infinity &&
      now > this.holdUntil &&
      this.eye !== this.baseEye &&
      !this.morphing
    ) {
      this.morphEye(this.baseEye);
    }
    if (this.sleeping && now > this.nextZ) {
      this.particles.push({
        type: 'z',
        x: this.R * 0.55,
        y: -this.R * 0.55,
        vx: 9,
        vy: -20,
        age: 0,
        life: 2400,
        rot: 0,
        spin: 0,
        size: 8 + Math.random() * 4,
        honey: false,
      });
      this.nextZ = now + 1300;
    }
    for (const p of this.particles) {
      p.age += dt;
      p.x += (p.vx * dt) / 1000;
      p.y += (p.vy * dt) / 1000;
      if (p.type === 'star') {
        p.vy += (140 * dt) / 1000;
        p.rot += (p.spin * dt) / 1000;
      } else {
        p.x += Math.sin(p.age / 300) * 0.15;
      }
    }
    this.particles = this.particles.filter((p) => p.age < p.life);
  }

  draw(now: number) {
    for (const target of this.targets) {
      // a canvas in a `display: none` subtree (open menu, hidden sheet) has no client rect
      if (target.canvas.getClientRects().length === 0) {
        continue;
      }
      this.drawTo(target, now);
    }
  }

  // ---------- internals ----------

  private tween(prop: Prop, keys: Key[], done?: () => void) {
    this.tweens.set(prop, { keys, index: 0, from: this.s[prop], start: performance.now(), done });
  }

  /** the eyes shrink to nothing, change shape, and pop back */
  private morphEye(shape: EyeShape) {
    if (shape === this.eye) {
      return;
    }
    if (this.morphing) {
      this.pending = shape;
      return;
    }
    this.morphing = true;
    this.tween('es', [[0, 70, EASE.in]], () => {
      this.eye = shape;
      this.tween('es', [[1, 150, EASE.back]], () => {
        this.morphing = false;
        if (this.pending) {
          const next = this.pending;
          this.pending = null;
          this.morphEye(next);
        }
      });
    });
  }

  private blink() {
    if (this.eye !== 'pill' && this.eye !== 'wide') {
      return;
    }
    this.tween('open', [
      [0.1, 70, EASE.in],
      [1, 120, EASE.out],
    ]);
  }

  private burst(count: number) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        type: 'star',
        x: (Math.random() - 0.5) * this.R * 1.4,
        y: -this.R * 0.5,
        vx: (Math.random() - 0.5) * 90,
        vy: -70 - Math.random() * 70,
        age: 0,
        life: 900 + Math.random() * 500,
        rot: Math.random() * 6,
        spin: (Math.random() - 0.5) * 6,
        size: 3 + Math.random() * 3.5,
        honey: Math.random() > 0.4,
      });
    }
  }

  private bodyPath(ctx: CanvasRenderingContext2D, rx: number, ry: number) {
    ctx.beginPath();
    for (let i = 0; i <= SEGMENTS; i += 1) {
      const a = (i / SEGMENTS) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const x = rx * Math.sign(c) * Math.abs(c) ** EXPONENT;
      const y = ry * Math.sign(sn) * Math.abs(sn) ** EXPONENT;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }

  private eyeAt(ctx: CanvasRenderingContext2D, x: number, y: number, shape: EyeShape) {
    const { R, s } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s.es, s.es);
    ctx.fillStyle = rgba(INK);
    ctx.strokeStyle = rgba(INK);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = R * 0.075;
    if (shape === 'pill' || shape === 'wide') {
      const w = R * (shape === 'wide' ? 0.3 : 0.25);
      const h = R * (shape === 'wide' ? 0.36 : 0.27) * s.open;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, w / 2);
      ctx.fill();
      if (shape === 'wide' && s.open > 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(-w * 0.18, -h * 0.22, w * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (shape === 'happy') {
      ctx.beginPath();
      ctx.arc(0, R * 0.07, R * 0.15, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else if (shape === 'closed') {
      ctx.beginPath();
      ctx.moveTo(-R * 0.14, 0);
      ctx.lineTo(R * 0.14, 0);
      ctx.stroke();
    } else if (shape === 'spiral') {
      ctx.lineWidth = R * 0.05;
      ctx.beginPath();
      for (let k = 0; k <= 46; k += 1) {
        const r = (k / 46) * R * 0.16;
        const a = k * 0.5;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (k === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawTo({ ctx, dpr }: Target, now: number) {
    const { R, W, H, s, cx, baseY } = this;
    const t = (now - this.t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const breathe = this.reduced ? 0 : this.sleeping ? 0.03 : 0.012;
    const bsy = 1 + breathe * Math.sin(t * 2.1);
    const bsx = 1 - breathe * 0.7 * Math.sin(t * 2.1);
    const bob = this.reduced || this.sleeping ? 0 : 1.2 * Math.sin(t * 1.5);
    const rx = R;
    const ry = R * 0.8;

    // the shadow on the ground, lighter while he is in the air
    const lift = clamp(1 + s.oy / 36, 0.3, 1);
    ctx.fillStyle = rgba(INK, 0.16 * lift);
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 5, R * 0.78 * s.sx * (0.7 + 0.3 * lift), R * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    const wobble = now < this.wobbleUntil ? Math.sin(t * 24) * 0.1 : 0;
    ctx.translate(cx, baseY + s.oy + bob);
    ctx.rotate(s.roll + wobble);
    ctx.scale(s.sx * bsx, s.sy * bsy);
    ctx.translate(0, -ry);

    // the paper body: a gradient, a highlight that follows the turn, a shade at the bottom
    const top = mix(PAPER_TOP, HONEY, s.tint * 0.5);
    const bottom = mix(PAPER_BOTTOM, HONEY, s.tint * 0.7);
    const fill = ctx.createLinearGradient(0, -ry, 0, ry);
    fill.addColorStop(0, rgba(top));
    fill.addColorStop(1, rgba(bottom));
    this.bodyPath(ctx, rx, ry);
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.save();
    this.bodyPath(ctx, rx, ry);
    ctx.clip();
    const hx = -rx * 0.35 + s.yaw * rx * 0.12;
    const hy = -ry * 0.45;
    const highlight = ctx.createRadialGradient(hx, hy, 0, hx, hy, R * 0.9);
    highlight.addColorStop(0, 'rgba(255,255,255,0.62)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
    const shade = ctx.createRadialGradient(0, ry * 1.1, 0, 0, ry * 1.1, R * 1.1);
    shade.addColorStop(0, rgba(INK, 0.14));
    shade.addColorStop(1, rgba(INK, 0));
    ctx.fillStyle = shade;
    ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
    ctx.restore();

    // the stitched seam inside the edge (the path keeps the scaled points after restore)
    ctx.save();
    ctx.scale(0.86, 0.85);
    this.bodyPath(ctx, rx, ry);
    ctx.restore();
    ctx.setLineDash([2.5, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(INK, 0.28);
    ctx.stroke();
    ctx.setLineDash([]);

    // the face slides across the body to look around
    const fx = s.yaw * R * 0.3;
    const fy = R * 0.1 + s.pitch * R * 0.2;
    for (const side of [-1, 1]) {
      const bx = fx + side * R * 0.72;
      const by = fy + R * 0.03;
      const blush = ctx.createRadialGradient(bx, by, 0, bx, by, R * 0.2);
      blush.addColorStop(0, rgba(HONEY, 0.45));
      blush.addColorStop(1, rgba(HONEY, 0));
      ctx.fillStyle = blush;
      ctx.beginPath();
      ctx.ellipse(bx, by, R * 0.22, R * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const left: EyeShape = this.eye === 'wink' ? 'pill' : this.eye;
    const right: EyeShape = this.eye === 'wink' ? 'happy' : this.eye;
    this.eyeAt(ctx, fx - R * 0.37, fy, left);
    this.eyeAt(ctx, fx + R * 0.37, fy, right);

    // paper hands, for the hello
    if (s.hands > 0.01) {
      for (const side of [-1, 1]) {
        ctx.save();
        if (side === -1 && now < this.waveUntil) {
          ctx.translate(-rx * 0.82, -ry * 0.05);
          ctx.rotate(-0.7 + Math.sin(t * 16) * 0.55);
          ctx.translate(-R * 0.12, -R * 0.22);
        } else {
          ctx.translate(side * rx * 0.92, ry * 0.25);
        }
        const size = R * 0.19 * s.hands;
        ctx.fillStyle = rgba(mix(PAPER_TOP, PAPER_BOTTOM, 0.4));
        ctx.strokeStyle = rgba(INK, 0.25);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    // stars and z's, around the body at rest
    ctx.save();
    ctx.translate(cx, baseY - ry);
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = clamp((1 - p.age / p.life) * 1.3, 0, 1);
      if (p.type === 'star') {
        ctx.rotate(p.rot);
        ctx.fillStyle = rgba(p.honey ? HONEY : INK);
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const r = i % 2 ? p.size * 0.45 : p.size;
          const angle = -Math.PI / 2 + (i * Math.PI) / 5;
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = rgba(INK);
        ctx.font = `600 ${p.size}px 'Instrument Sans', system-ui, sans-serif`;
        ctx.fillText('z', 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
