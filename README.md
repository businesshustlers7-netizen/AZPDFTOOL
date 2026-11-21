# AZ PDF Toolkit

> **Free · Private · In-Browser** — No uploads, no sign-up, no backend.

A browser-based PDF utility built live during the **AZ Career Link — Job Preparation Series** webinar.  
Every PDF operation runs entirely in your browser. Your files never leave your device.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Merge multiple PDFs into one | ✅ |
| Delete specific pages | ✅ |
| Rotate pages (CW / CCW) | ✅ |
| Extract page ranges (e.g. `1-3, 5`) | ✅ |
| Drag-and-drop file upload | ✅ |
| Page thumbnail previews | ✅ |
| Dark mode | ✅ |
| Keyboard accessible (WCAG AA) | ✅ |
| No server, no account, no tracking | ✅ |

---

## 🚀 How to Use

### Option A — Open directly in a browser (no install needed)
1. Download or clone this repository.
2. Double-click **`index.html`** to open it in your browser.  
   *(Works in Chrome, Firefox, Edge, and Safari.)*

### Option B — Live on GitHub Pages
👉 [https://your-username.github.io/az-pdf-toolkit](https://your-username.github.io/az-pdf-toolkit)

---

## 🛠️ Run Locally (Developer)

No build step needed. Just serve the files with any static server:

```bash
# Using Python (available on most systems)
python -m http.server 8080

# Then open:
# http://localhost:8080
```

Or install the VS Code **Live Server** extension and click **Go Live**.

---

## 📁 Project Structure

```
az-pdf-toolkit/
│
├── index.html          ← Single-page app shell; loads libraries + main.js
├── style.css           ← All styles with CSS variables for dark/light mode
│
├── js/
│   ├── main.js         ← Entry point: tabs, dark mode, event wiring
│   ├── uploader.js     ← File picker, drag-and-drop, file list (Merge tab)
│   ├── merger.js       ← Merges PDFs using pdf-lib
│   ├── editor.js       ← Deletes & rotates pages using pdf-lib
│   ├── extractor.js    ← Extracts page ranges using pdf-lib
│   ├── thumbnails.js   ← Renders page previews using pdf.js
│   └── utils.js        ← Shared helpers: download, error, toast, range parser
│
└── README.md
```

---

## 📚 Libraries Used

| Library | Version | Purpose | License |
|---------|---------|---------|---------|
| [pdf-lib](https://github.com/Hopding/pdf-lib) | 1.17.1 | All PDF write operations (merge, delete, rotate, extract) | MIT |
| [pdf.js](https://mozilla.github.io/pdf.js/) | 3.11.174 | Read-only page thumbnail rendering | Apache 2.0 |

Both are loaded from CDN with pinned version numbers. No `npm install` required.

---

## 🏗️ Architecture Notes

### How Merge Works
1. Each File is read with `file.arrayBuffer()`.
2. pdf-lib loads each buffer as a `PDFDocument`.
3. Pages are copied from each source document into a single output `PDFDocument`.
4. The output is saved as `Uint8Array` and downloaded via a temporary Object URL.

### How Delete Works
Pages are removed using `PDFDocument.removePage(index)`.

> ⚠️ **Index-shifting bug**: Calling `removePage()` in ascending order shifts
> indices after every removal, causing the wrong pages to be deleted.
>
> **Fix**: always sort selected indices in **descending order** before removing.
>
> ```js
> // ❌ WRONG
> selected.forEach(i => pdfDoc.removePage(i));
>
> // ✅ CORRECT
> [...selected].sort((a, b) => b - a).forEach(i => pdfDoc.removePage(i));
> ```

### How Thumbnails Work
pdf.js renders each page onto an off-screen `<canvas>` at a scale of ~150 px wide.
The canvas is converted to a JPEG data URL and displayed as an `<img>`.
This keeps memory lower than holding many full-size canvases.

---

## 🔒 Privacy

- **Zero file uploads** — `file.arrayBuffer()` reads files locally using the browser's File API.
- **No analytics** — no Google Analytics, no tracking pixels, no cookies.
- **Object URL cleanup** — download links are revoked with `URL.revokeObjectURL()` after 1.5 seconds.
- **No localStorage for files** — only the user's dark-mode preference is saved to `localStorage`.

---

## 🌐 Deploy to GitHub Pages

1. Push all files to the `main` branch of a public GitHub repository.
2. Go to **Settings → Pages**.
3. Set **Source** → `Deploy from branch` → `main` → `/ (root)`.
4. Click **Save**. Your app will be live at:
   ```
   https://<your-username>.github.io/<repo-name>
   ```

---

## 🤝 Contributing

This is a portfolio + teaching project. Contributions and forks are welcome!

1. Fork the repo.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with the convention below.
4. Open a pull request.

### Commit Message Convention

```
type(scope): short description

Types: feat, fix, style, docs, test, refactor, chore

Examples:
  feat(merger): add drag-and-drop file reorder
  fix(editor): sort indices descending before removePage
  docs(readme): add deployment steps
  style(ui): improve dark mode contrast ratio
  chore(deps): pin pdf-lib to 1.17.1
```

---

## 📄 License

MIT © AZ Career Link

---

## 🙏 Acknowledgements

Built live during the **AZ Career Link — Job Preparation Series** webinar using
[Google Antigravity](https://antigravity.dev) AI-assisted coding.
