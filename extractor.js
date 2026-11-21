/**
 * extractor.js — Extracts a page range from a PDF (plain global script)
 * Depends on: utils.js
 * pdf-lib is available as window.PDFLib (CDN script tag in index.html)
 */

function Extractor() {
  this.currentFile     = null;
  this.currentPdfBytes = null; // Uint8Array — master copy
  this.totalPages      = 0;
}

Extractor.prototype.getSafeBuffer = function() {
  if (!this.currentPdfBytes || this.currentPdfBytes.length === 0) {
    throw new Error('No PDF data available.');
  }
  var freshCopy = new Uint8Array(this.currentPdfBytes.length);
  freshCopy.set(this.currentPdfBytes);
  return freshCopy.buffer;
};

Extractor.prototype.loadFile = async function(file) {
  clearError();
  showLoading(true, 'Loading PDF…');
  try {
    var rawBuffer        = await file.arrayBuffer();
    this.currentFile     = file;
    this.currentPdfBytes = new Uint8Array(rawBuffer);

    var PDFDocument = window.PDFLib.PDFDocument;
    var pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(this.getSafeBuffer());
    } catch (err) {
      var msg = (err && err.message) ? err.message : '';
      if (msg.includes('password') || msg.includes('encrypt')) {
        throw new Error('This PDF is password-protected and cannot be edited.');
      }
      throw new Error('This file appears to be damaged or is not a valid PDF.');
    }

    this.totalPages = pdfDoc.getPageCount();
    return this.totalPages;

  } finally {
    showLoading(false);
  }
};

Extractor.prototype.extractPages = async function(rangeStr) {
  clearError();
  if (!this.currentPdfBytes || this.currentPdfBytes.length === 0) {
    showError('No file loaded. Please upload a PDF first.');
    return;
  }

  var result = parseRange(rangeStr, this.totalPages);
  if (result.error) {
    showError(result.error);
    return;
  }

  var pages = result.pages;
  showLoading(true, 'Extracting ' + pages.length + ' page(s)…');
  try {
    var PDFDocument = window.PDFLib.PDFDocument;
    var srcDoc      = await PDFDocument.load(this.getSafeBuffer());
    var outDoc      = await PDFDocument.create();

    var copiedPages = await outDoc.copyPages(srcDoc, pages);
    copiedPages.forEach(function(page) {
      outDoc.addPage(page);
    });

    var pdfBytes = await outDoc.save();
    downloadBlob(pdfBytes, 'extracted.pdf');
    showToast('✅ Extracted ' + pages.length + ' page(s). Download started!');
  } catch (err) {
    showError('Failed to extract pages: ' + ((err && err.message) || 'Unknown error.'));
  } finally {
    showLoading(false);
  }
};
