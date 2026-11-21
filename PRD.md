# AZ PDF Toolkit — Product Requirements Document (PRD)

> **Version:** 1.0 | **Date:** 2026-11-21 | **Author:** Product Team

---

## 1. Overview

### Product Summary
**AZ PDF Toolkit** is a free, browser-based PDF utility that lets users merge, delete, reorder, rotate, and extract pages from PDF files — all without uploading files to any server.

### Problem Statement
Engineering students and job-seekers frequently need to combine offer letters, transcripts, certificates, and ID proofs into a single PDF. Existing free tools (ILovePDF, SmallPDF, etc.) require file uploads to unknown third-party servers, charge for core features, or display intrusive ads. Students are rightfully reluctant to share sensitive documents with these services.

### Vision
A lightweight, trustworthy PDF tool that runs entirely in the browser, requires zero sign-up, and processes every file locally on the user's own device.

### Value Proposition
- **Private by design** — files never leave the device.
- **Free, forever** — no paywalls, no account required.
- **Beginner-friendly** — simple, clean UI that works on any modern browser.
- **Portfolio-ready** — built live in a student webinar using AI-assisted coding, showing real software development practices.

---

## 2. Goals and Non-Goals

### Goals
| # | Goal | Measure of Success |
|---|------|--------------------|
| G1 | Users can merge ≥ 2 PDFs into one download | Merge completes without error for files up to 50 MB total |
| G2 | Users can delete specific pages from a PDF | Deleted pages do not appear in the downloaded result |
| G3 | Users can reorder and rotate pages | Final PDF reflects the chosen order and rotation |
| G4 | Users can extract a page range (e.g. "1-3, 5") | Extracted PDF contains exactly the specified pages |
| G5 | Zero network transfer of file content | Verified by DevTools network tab showing 0 file-upload requests |
| G6 | App loads in < 3 seconds on a standard 4G connection | Measured with Lighthouse |
| G7 | No backend infrastructure cost ever | 100% static hosting on GitHub Pages |

### Non-Goals (v1)
- Server-side processing of any kind
- User accounts, login, or cloud storage
- OCR, text editing, or PDF annotation
- Password removal or encryption
- Image compression or PDF compression
- Analytics, crash reporting, or any user tracking

---

## 3. Target Users and Personas

### Persona 1 — Priya, the Final-Year Engineering Student
- **Age:** 21 | **Location:** Pune, India | **Device:** Mid-range Android phone + college lab Windows PC
- **Needs:** Combine her resume, marksheet, and certificates into one PDF for job portal submissions.
- **Pain Points:** Free tools ask her to sign up or show payment walls after one use. She is nervous about uploading her Aadhaar card to random websites.
- **Context of Use:** Uses the tool on her phone while commuting or in the college lab just before an application deadline.

### Persona 2 — Rahul, the Campus Placement Coordinator
- **Age:** 24 | **Location:** Bengaluru, India | **Device:** Windows laptop
- **Needs:** Quickly assemble student document packets for companies: merge multiple students' one-pagers, remove blank pages, extract specific sections.
- **Pain Points:** Paid tools are not available on shared college computers. He needs to process ~10–15 PDFs in a session without uploading confidential data.
- **Context of Use:** Uses a shared lab computer with restricted software installation; relies entirely on browser-based tools.

---

## 4. User Stories

### Merge PDFs
- As a student, I want to upload multiple PDF files so that I can merge them into one document for a job application.
- As a user, I want to drag and drop PDF files onto the page so that I don't have to use the file picker every time.
- As a user, I want to remove a file from the list before merging so that I don't have to restart if I added the wrong file.
- As a user, I want to reorder files in the list before merging so that the final PDF is in the right sequence.

### Delete Pages
- As a student, I want to see thumbnail previews of each page so that I can identify which pages to delete.
- As a user, I want to select one or more pages by clicking their thumbnails so that I can delete them in one action.
- As a user, I want to download the PDF with the selected pages removed so that I get a clean final document.

### Reorder & Rotate Pages
- As a user, I want to drag page thumbnails into a different order so that the final PDF matches my intended sequence.
- As a user, I want to rotate a page 90° clockwise or anti-clockwise so that upside-down scans are fixed before I download.

### Extract / Split
- As a student, I want to type a page range like "1-3, 5" so that I can extract only the pages I need into a separate PDF.

### Error Handling & UX
- As a user, I want to see a clear error message if I upload a password-protected or corrupt PDF so that I know what went wrong.
- As a user, I want a loading indicator while thumbnails are being generated so that I know the app is working.
- As a user, I want to see the file size next to each file name so that I know if the file is too large to process smoothly.

---

## 5. Functional Requirements

| ID | Requirement | Priority | Milestone |
|----|-------------|----------|-----------|
| FR-01 | Accept multiple PDF files via a file-picker dialog | Must | M1 |
| FR-02 | Accept PDF files via drag-and-drop onto the app window | Must | M1 |
| FR-03 | Display a list of uploaded files with name and size | Must | M1 |
| FR-04 | Allow removing a file from the upload list | Must | M1 |
| FR-05 | Allow reordering files in the upload list (drag or up/down buttons) | Must | M1 |
| FR-06 | Merge all listed PDFs and trigger a browser download | Must | M1 |
| FR-07 | Display page thumbnails for a single loaded PDF | Must | M2 |
| FR-08 | Allow selecting/deselecting individual page thumbnails | Must | M2 |
| FR-09 | Delete selected pages and download the resulting PDF | Must | M2 |
| FR-10 | Show a friendly error for password-protected PDFs | Must | M2 |
| FR-11 | Show a friendly error for corrupt or non-PDF files | Must | M2 |
| FR-12 | Drag-and-drop reordering of page thumbnails | Should | M3 |
| FR-13 | Rotate a selected page 90° (clockwise and anti-clockwise) | Should | M3 |
| FR-14 | Extract pages by a typed range string (e.g. "1-3, 5") | Should | M3 |
| FR-15 | Display file size and show a warning for files > 30 MB | Should | M3 |
| FR-16 | Show loading spinners/progress during thumbnail generation | Should | M2 |
| FR-17 | Dark mode toggle | Could | M4 |
| FR-18 | Convert an image (JPG/PNG) to PDF | Could | M5 |
| FR-19 | Offline PWA support | Could | M5 |
| FR-20 | Keyboard shortcuts for common actions | Could | M4 |

---

## 6. Acceptance Criteria

### FR-01 & FR-02 — File Upload
- **Given** a user opens the app, **When** they click "Add Files" and select 2 valid PDFs, **Then** both files appear in the list with correct names and sizes.
- **Given** a user drags a PDF onto the drop zone, **When** they release the file, **Then** it is added to the list immediately.
- **Edge case:** If the user drops a `.txt` file, the app shows "Only PDF files are supported" and does not add it to the list.

### FR-06 — Merge and Download
- **Given** ≥ 2 PDFs are in the list, **When** the user clicks "Merge & Download", **Then** a single PDF is downloaded containing all pages in list order.
- **Edge case:** If only 1 file is in the list, the merge button is disabled or shows "Add at least 2 files to merge."

### FR-07 — Page Thumbnails
- **Given** the user loads a 10-page PDF, **When** rendering completes, **Then** exactly 10 thumbnails are shown in the correct page order.
- **Edge case:** A 1-page PDF shows exactly 1 thumbnail with no index errors.

### FR-08 & FR-09 — Select and Delete Pages
- **Given** thumbnails are shown for a 5-page PDF, **When** the user selects pages 2 and 4 and clicks "Delete Selected", **Then** the downloaded PDF contains pages 1, 3, and 5 only.
- **Edge case:** Selecting all pages and clicking "Delete Selected" shows the error "Cannot delete all pages — the result would be empty."

### FR-10 — Password-Protected PDF
- **Given** a password-protected PDF is uploaded, **When** pdf-lib or pdf.js attempts to load it, **Then** the app shows "This PDF is password-protected and cannot be edited."

### FR-11 — Corrupt/Non-PDF File
- **Given** a file with a `.pdf` extension but invalid content is uploaded, **When** parsing fails, **Then** the app shows "This file appears to be damaged or is not a valid PDF."

---

## 7. User Flows

### Flow A — Merge PDFs
```
[User opens app]
       |
       v
[Drop zone / "Add Files" button visible]
       |
       v
[User selects or drags ≥ 2 PDF files]
       |
       v
[File list shows: name, size, remove icon, drag handle]
       |
  +----|----+
  |         |
  v         v
[Remove a  [Reorder files
 file?]      by dragging]
  |              |
  +------+--------+
         |
         v
[Click "Merge & Download"]
         |
         v
[pdf-lib merges PDFs in memory]
         |
         v
[Browser downloads "merged.pdf"]
```

### Flow B — Delete Pages
```
[User opens app]
       |
       v
[Click "Edit / Delete Pages" tab]
       |
       v
[User uploads a single PDF]
       |
       v
[pdf.js renders page thumbnails]
       |
       v
[User clicks thumbnails to select pages]
  (selected pages show a red border / checkmark)
       |
       v
[Click "Delete Selected"]
       |
  +----|----+
  |         |
  v         v
[0 pages  [All pages    [Valid subset
 selected] selected]     selected]
  |              |             |
 Warn           Warn       pdf-lib removes
                           selected pages
                                |
                                v
                     [Browser downloads result]
```

### Flow C — Extract Page Ranges
```
[User opens app]
       |
       v
[Click "Extract Pages" tab]
       |
       v
[User uploads a single PDF]
       |
       v
[User types range: "1-3, 5"]
       |
       v
[App parses range and validates against page count]
       |
  +----|----+
  |         |
  v         v
[Invalid   [Valid range]
 range]         |
  |         pdf-lib copies
 Show error  specified pages
              into new PDF
                  |
                  v
         [Browser downloads "extracted.pdf"]
```

---

## 8. UI and UX Requirements

### Main Screen Layout
- **Header:** App name "AZ PDF Toolkit", tagline "Free · Private · In-Browser", and a dark-mode toggle.
- **Tab Bar:** Three tabs — `Merge`, `Edit Pages`, `Extract`.
- **Drop Zone / Work Area:** Large drag-and-drop zone with an upload icon, centered text, and an "Add Files" button. Changes to a file list or thumbnail grid once files are loaded.
- **Action Bar (bottom of work area):** Context-sensitive buttons (e.g., "Merge & Download", "Delete Selected", "Extract").
- **Footer:** "No files are uploaded to any server" privacy notice + GitHub link.

### Responsive Behavior
| Screen Size | Behavior |
|-------------|----------|
| Desktop (≥ 1024 px) | Two-column layout: file list left, preview/thumbnails right |
| Tablet (600–1023 px) | Single column, thumbnails in a 3-column grid |
| Mobile (< 600 px) | Single column, thumbnails in a 2-column grid, touch-friendly tap targets ≥ 44 px |

### States
| State | UI Behavior |
|-------|-------------|
| **Empty** | Drop zone shown with instructional text |
| **Loading** | Spinner overlay + "Rendering pages…" text, action buttons disabled |
| **Error** | Red banner at top of work area with error message and a dismiss button |
| **Success** | Download starts automatically; a green toast "Download started!" fades out after 3 s |

### Accessibility Requirements
- All interactive elements have descriptive `aria-label` attributes.
- Tab/keyboard navigation works throughout (tab, enter, space, arrow keys for drag simulation).
- Color contrast ratio ≥ 4.5:1 for all text (WCAG AA).
- Focus indicators are visible on all focusable elements.
- Error messages are announced via `role="alert"` or `aria-live="assertive"`.
- Thumbnail images have `alt` text in the format `"Page N of filename.pdf"`.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Privacy** | Zero bytes of file content are sent over the network. No cookies, localStorage, or analytics. |
| **Performance** | Merge of 5 PDFs totalling 20 MB completes in < 10 s on a modern laptop. Thumbnails for a 20-page PDF render in < 5 s. |
| **File size support** | Warn users (do not block) for files > 30 MB. Hard limit at 200 MB per file (browser memory protection). |
| **Browser support** | Latest 2 versions of Chrome, Firefox, Edge, and Safari. No IE support. |
| **Mobile support** | Fully usable on iOS Safari and Android Chrome. Touch drag-and-drop for reorder is a Should-have. |
| **Reliability** | No data loss — if an operation fails, the original file is unmodified. User can always retry. |
| **Dependencies** | Only two external libraries: pdf-lib (MIT license) and pdf.js (Apache 2.0 license), pinned to specific CDN versions. |

---

## 10. Technical Architecture

### Recommended File Structure
```
az-pdf-toolkit/
├── index.html          # Single HTML shell, loads all modules
├── style.css           # All styles, CSS custom properties for theming
├── js/
│   ├── main.js         # App entry point, tab routing, event wiring
│   ├── uploader.js     # File picker, drag-and-drop, file list management
│   ├── merger.js       # Merge logic using pdf-lib
│   ├── editor.js       # Delete pages, rotate, reorder logic using pdf-lib
│   ├── extractor.js    # Page range parsing and extraction logic
│   ├── thumbnails.js   # Thumbnail rendering using pdf.js
│   └── utils.js        # Shared helpers: download, error display, range parser
├── assets/
│   └── icons/          # SVG icons
└── README.md
```

### Module Responsibilities
| Module | Responsibility |
|--------|---------------|
| `main.js` | Initialises the app, handles tab switching, delegates to feature modules |
| `uploader.js` | Manages the file list (add, remove, reorder); emits `filesChanged` events |
| `merger.js` | Uses `pdf-lib` to merge `ArrayBuffer` objects from `File.arrayBuffer()` |
| `editor.js` | Uses `pdf-lib` to delete/rotate/reorder pages in a loaded PDF |
| `extractor.js` | Parses a range string into a sorted list of 0-indexed page numbers, calls `editor.js` |
| `thumbnails.js` | Loads a PDF with `pdfjsLib`, renders each page to a `<canvas>`, returns `<img>` elements |
| `utils.js` | `downloadBlob()`, `showError()`, `parseRange()`, `formatBytes()` |

### Data Flow
```
File input / Drop event
        |
        v
  File object (browser memory)
        |
        v
  ArrayBuffer (via File.arrayBuffer())
        |
     +--+---+---+
     |      |   |
     v      v   v
  merger  editor  thumbnails
 (pdf-lib)(pdf-lib) (pdf.js)
     |      |
     v      v
  Uint8Array → Blob → Object URL → <a download> click → revoke URL
```

### How pdf-lib and pdf.js are Used
- **pdf-lib** (`PDFDocument.load(arrayBuffer)`) — used for all write operations: merge, delete, rotate, extract. It works with `ArrayBuffer` and returns `Uint8Array`.
- **pdf.js** (`pdfjsLib.getDocument({data: arrayBuffer})`) — used **read-only** for rendering page thumbnails to `<canvas>`. It never writes PDFs.
- Both libraries are loaded from a CDN with Subresource Integrity (SRI) hashes pinned in `index.html`.

### ⚠️ Index-Shifting Bug Risk (Critical)
When deleting multiple pages from a PDF using pdf-lib, **you must not iterate over selected page indices in ascending order and call `removePage()` one at a time.** Each call to `removePage(i)` shifts all subsequent page indices down by 1, causing incorrect pages to be deleted.

**Correct approach:** Sort the selected indices in **descending order** before removing, so that removing a later page does not affect the indices of earlier pages.

```js
// WRONG — shifts indices after each removal
selectedIndices.forEach(i => pdfDoc.removePage(i));

// CORRECT — remove from the end first
[...selectedIndices].sort((a, b) => b - a).forEach(i => pdfDoc.removePage(i));
```

---

## 11. Edge Cases and Error Handling

| Scenario | Expected Behavior | User Message |
|----------|-------------------|--------------|
| Password-protected PDF | Catch the error thrown by pdf-lib/pdf.js on load | "This PDF is password-protected and cannot be edited." |
| Corrupt or truncated PDF | Catch parse error | "This file appears to be damaged or is not a valid PDF." |
| Non-PDF file (e.g., .docx) | Check MIME type or file extension before processing | "Only PDF files are supported." |
| File > 30 MB | Show a warning but still allow processing | "⚠️ Large file detected. Processing may be slow." |
| File > 200 MB | Reject before loading into memory | "This file is too large (max 200 MB). Please use a smaller file." |
| Zero-page result (all pages deleted) | Validate before calling download | "Cannot create an empty PDF. Please keep at least one page." |
| Duplicate file names in merge | Allow — append an index to the output name if needed; do not block | No error; handle silently |
| Browser memory limit exceeded | Catch `out of memory` errors | "Your browser ran out of memory. Try a smaller file or close other tabs." |
| Cancelled download | No action needed — the in-memory PDF is not affected | No message needed |
| Invalid page range string | Validate the parsed range before processing | "Invalid page range. Use a format like '1-3, 5'." |

---

## 12. Security and Privacy

### No Network Transfer
All file processing uses the Web File API (`File.arrayBuffer()`). No `fetch()`, `XMLHttpRequest`, or `WebSocket` call is made with file data. This can be verified by inspecting the Network tab in browser DevTools.

### Safe Object URL Handling
After creating a download link with `URL.createObjectURL(blob)`, the app immediately calls `URL.revokeObjectURL(url)` after the download is triggered. This frees the memory reference and prevents the file from remaining accessible in the browser session.

### Dependency Integrity
CDN links for pdf-lib and pdf.js include `integrity` and `crossorigin` attributes with pinned SHA-256 SRI hashes. If the CDN delivers a modified file, the browser will refuse to load it.

### Licensing
- **pdf-lib:** MIT License — free for commercial and non-commercial use, no attribution required in the UI.
- **pdf.js:** Apache 2.0 License — free for all use; attribution in README is recommended.

### Privacy Statement (for the UI footer)
> "Your files are never uploaded to any server. All processing happens locally in your browser. We collect no data."

---

## 13. Milestones

### M1 — Scaffold and Merge
**Scope:** Core structure + merge feature.
**Deliverables:**
- `index.html`, `style.css`, `js/main.js`, `js/uploader.js`, `js/merger.js`, `js/utils.js`
- File list (add, remove, reorder with up/down buttons)
- Merge & Download button

**Definition of Done:** User can upload ≥ 2 PDFs, reorder them, merge, and download a valid combined PDF. No thumbnails yet.

---

### M2 — Thumbnails and Delete Pages
**Scope:** Visual page management.
**Deliverables:**
- `js/thumbnails.js`, `js/editor.js` (delete logic)
- Page thumbnail grid
- Select pages → Delete → Download
- Error handling for corrupt and password-protected files
- Loading indicators

**Definition of Done:** User can see thumbnails, select pages, delete them, and download the result. Errors are shown cleanly.

---

### M3 — Reorder, Rotate and Extract
**Scope:** Full editing feature set.
**Deliverables:**
- Drag-and-drop page reorder
- Rotate page 90° CW / CCW buttons
- `js/extractor.js` with range parser
- Large-file warning

**Definition of Done:** All three Should-have features work end-to-end without bugs. Index-shifting bug is explicitly tested.

---

### M4 — Polish and Accessibility
**Scope:** UX refinement.
**Deliverables:**
- Responsive layout (mobile, tablet, desktop)
- Dark mode toggle
- Keyboard shortcuts
- Full WCAG AA accessibility pass
- Cross-browser testing

**Definition of Done:** App scores ≥ 90 on Lighthouse Accessibility. Works on Chrome, Firefox, Edge, Safari, and mobile browsers.

---

### M5 — README and Deployment
**Scope:** Documentation and launch.
**Deliverables:**
- `README.md` (setup, usage, architecture overview)
- GitHub Pages deployment
- SRI hashes pinned in `index.html`

**Definition of Done:** App is live on `username.github.io/az-pdf-toolkit`. README is complete. Repo is public.

---

## 14. Testing Plan

### Sample Files Needed
| File | Description |
|------|-------------|
| `short.pdf` | 2-page valid PDF |
| `multipage.pdf` | 20-page valid PDF |
| `protected.pdf` | Valid but password-protected PDF |
| `corrupt.pdf` | File with `.pdf` extension but invalid byte content |
| `large.pdf` | PDF > 30 MB |
| `single.pdf` | 1-page PDF |

### Manual Test Cases

| # | Scenario | Input | Expected Result |
|---|----------|-------|----------------|
| TC-01 | Upload 2 valid PDFs and merge | `short.pdf` + `multipage.pdf` | Downloaded PDF has 22 pages |
| TC-02 | Reorder files before merge | Drag `multipage.pdf` above `short.pdf` | Merged PDF starts with multipage content |
| TC-03 | Remove a file from list | Add 3 files, remove middle one, merge | Merged PDF contains only 2 files' content |
| TC-04 | Drop zone drag-and-drop upload | Drag `short.pdf` onto drop zone | File appears in list |
| TC-05 | Upload a `.txt` file | Drag a text file onto drop zone | Error: "Only PDF files are supported" |
| TC-06 | Upload password-protected PDF | Load `protected.pdf` in Edit tab | Error: "This PDF is password-protected" |
| TC-07 | Upload corrupt file | Load `corrupt.pdf` | Error: "This file appears to be damaged" |
| TC-08 | Thumbnail rendering | Load `multipage.pdf` | 20 thumbnails appear; loading spinner disappears |
| TC-09 | Delete pages (non-contiguous) | Select pages 2 and 4 from a 5-page PDF, delete | Result has 3 pages (original 1, 3, 5) |
| TC-10 | Delete all pages | Select all pages, click Delete | Error: "Cannot create an empty PDF" |
| TC-11 | Rotate a page | Select page 1, click rotate CW | Thumbnail updates; downloaded PDF has page 1 rotated 90° |
| TC-12 | Extract page range | Enter "1-3, 5" in a 10-page PDF | Extracted PDF has 4 pages |
| TC-13 | Invalid range string | Enter "abc" or "5-3" | Error: "Invalid page range" |
| TC-14 | Large file warning | Upload `large.pdf` (> 30 MB) | Warning banner shown; processing still proceeds |
| TC-15 | Single-file merge attempt | Upload only 1 PDF and attempt merge | Button disabled or message "Add at least 2 files" |
| TC-16 | Download and re-open | Merge 3 PDFs and open result in Adobe Reader | PDF opens cleanly with correct page count |
| TC-17 | Mobile touch — tap to select thumbnail | Load PDF on Android Chrome, tap a thumbnail | Thumbnail is selected (highlighted border) |
| TC-18 | Keyboard navigation | Tab through all controls, press Enter on buttons | All actions are reachable by keyboard |

---

## 15. Deployment and Documentation

### GitHub Pages Deployment (High Level)
1. Create a public GitHub repository named `az-pdf-toolkit`.
2. Push all project files to the `main` branch.
3. In repo **Settings → Pages**, set Source to `Deploy from branch`, branch `main`, folder `/ (root)`.
4. GitHub assigns a URL: `https://<username>.github.io/az-pdf-toolkit`.
5. Test all features on the live URL.

### README Outline
```
# AZ PDF Toolkit
> Free, private, browser-based PDF tool.

## Features
## How to Use
## Run Locally (just open index.html)
## Project Structure
## Libraries Used (pdf-lib, pdf.js — with version and license)
## Contributing
## License
```

### Commit Message Convention
```
type(scope): short description

Types: feat, fix, style, docs, test, refactor, chore
Examples:
  feat(merger): add drag-and-drop file reorder
  fix(editor): sort indices descending before removePage
  docs(readme): add deployment steps
  style(ui): improve dark mode contrast ratio
```

---

## 16. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Browser memory exhaustion on very large PDFs | Medium | High | Enforce 200 MB hard limit; show warning at 30 MB |
| Index-shifting bug when deleting multiple pages | High | High | Sort selected indices descending before removal (called out in architecture section) |
| CDN goes down (pdf-lib / pdf.js unavailable) | Low | High | Pin SRI hashes; consider vendoring libraries in `lib/` as a fallback |
| pdf-lib cannot open certain PDF versions/features | Medium | Medium | Catch load errors and show a helpful error message; test against diverse real-world PDFs |
| Safari WebKit differences in File API or canvas | Medium | Medium | Test on real iOS Safari; add polyfills if needed |
| Students fork the repo and add tracking scripts | Low | Medium | MIT license cannot prevent this; include a privacy pledge in the README |
| Out-of-scope feature creep during webinar | High | Low | Strict MoSCoW discipline; defer all "Could have" to separate issues |

---

## 17. Assumptions and Open Questions

### Assumptions Made
1. Users have a modern browser (Chrome/Firefox/Edge/Safari within last 2 versions). No IE11 support is needed.
2. The CDN for pdf-lib and pdf.js is `unpkg.com` or `cdnjs.cloudflare.com` — specific versions to be pinned at build time.
3. Output file name defaults: `merged.pdf`, `edited.pdf`, `extracted.pdf`. No custom naming in v1.
4. Thumbnails are rendered at 150 px wide — a balance between clarity and performance.
5. "Reorder pages" in the Edit tab means drag-and-drop of thumbnails; up/down buttons are the fallback for accessibility.
6. Page numbers in the range extractor are **1-indexed** in the UI (the user types "1" for the first page), but converted to **0-indexed** internally for pdf-lib.
7. The app will be built and demonstrated in approximately 5 webinar sessions, one milestone per session.
8. The project is licensed under MIT — open source, freely forkable by students.

---

## 18. Future Scope

| Idea | Description |
|------|-------------|
| **Image to PDF** | Allow users to upload JPG/PNG images and convert them to a PDF using pdf-lib's `embedJpg`/`embedPng` APIs |
| **Offline PWA** | Add a `manifest.json` and Service Worker to cache the app shell and CDN libraries for offline use |
| **Student Document Toolkit** | Pre-built templates: "Job Application Packet", "Exam Form Bundle", "Internship Report Cover" |
| **PDF Compression** | Use a WebAssembly port of Ghostscript or similar to reduce file size in-browser |
| **Password Removal** | Support user-supplied passwords to unlock and re-save PDFs without protection |
| **Bulk Operations** | Queue multiple PDFs and apply the same edit (e.g., delete page 1 from each) in one click |
| **Share via Link** | Encrypt the PDF client-side and share via a URL hash — zero server storage needed |

---

## Audience Summary (Read-Aloud Paragraph)

> We are building the **AZ PDF Toolkit** — a completely free, browser-based PDF tool designed specifically for engineering students who need to merge, edit, and extract pages from their documents without uploading sensitive files to unknown servers. Every operation runs directly in the user's browser using two well-established open-source libraries, pdf-lib and pdf.js, with no backend, no sign-up, and no cost. The project will be built live across five webinar sessions using AI-assisted coding, making it both a practical tool for students and a compelling portfolio piece that demonstrates real software engineering skills — from clean architecture and accessibility to privacy-first design and GitHub Pages deployment.

---

*PRD saved at: `d:\Arbaaz -E\AZ Career Link\Webinars\Job Prepration Series\projects\AZ PDF Tool\PRD.md`*
