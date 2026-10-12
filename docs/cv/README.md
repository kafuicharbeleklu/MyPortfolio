# Public CV

`cv-fr.html` and `cv-en.html` are the sources of the two PDFs served by the site
(`public/documents/cv/CV_Kafui_Charbel_Eklu_FR.pdf` and `..._EN.pdf`). They share `cv.css`.

They are the public version of the CV: no date of birth, no nationality, no street address, no
financial amounts, and no sentence written for a specific employer. Keep the two languages in step.

To regenerate a PDF after an edit (Edge or Chrome, from the repository root):

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --no-pdf-header-footer `
  --virtual-time-budget=10000 `
  --print-to-pdf="$PWD\public\documents\cv\CV_Kafui_Charbel_Eklu_FR.pdf" `
  "file:///$($PWD -replace '\','/')/docs/cv/cv-fr.html"
```

The fonts load from Google Fonts, so the command needs network access.
