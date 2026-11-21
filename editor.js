/**
 * editor.js — Delete & rotate pages using pdf-lib (plain global script)
 * Depends on: utils.js, thumbnails.js
 *
 * ⚠️ INDEX-SHIFTING BUG: When deleting multiple pages with pdf-lib,
 * ALWAYS sort selected indices in DESCENDING order before calling removePage().
 *
 * ⚠️ DETACHED ARRAYBUFFER PREVENTION:
 * Storing data as Uint8Array (this.currentPdfBytes) and allocating a fresh
 * independent ArrayBuffer via getSafeBuffer() for every pdf-lib / pdf.js call
 * completely prevents "Cannot perform Construct on a detached ArrayBuffer".
 */

function Editor() {
  this.currentFile      = null;
  this.currentPdfBytes  = null; // Uint8Array — master copy of current PDF bytes
  this.thumbnails       = [];   // Array of DOM thumbnail items
  this.onSelectionChange = null;
}

/**
 * Returns a brand-new, independent ArrayBuffer containing the current PDF bytes.
 * This guarantees the master Uint8Array is NEVER detached by pdf-lib or pdf.js.
 */
Editor.prototype.getSafeBuffer = function() {
  if (!this.currentPdfBytes || this.currentPdfBytes.length === 0) {
    throw new Error('No PDF data available.');
  }
  var freshCopy = new Uint8Array(this.currentPdfBytes.length);
  freshCopy.set(this.currentPdfBytes);
  return freshCopy.buffer;
};

Editor.prototype.getSelected = function() {
  return getSelectedIndices(this.thumbnails);
};

Editor.prototype.selectAll = function(cb) {
  selectAll(this.thumbnails, cb);
};

Editor.prototype.deselectAll = function(cb) {
  deselectAll(this.thumbnails, cb);
};

/**
 * Loads a PDF file, validates it with pdf-lib, then renders thumbnails.
 */
Editor.prototype.loadFile = async function(file, gridContainer, onSelectionChange) {
  showLoading(true, 'Loading PDF…');
  try {
    var rawBuffer = await file.arrayBuffer();
    this.currentFile       = file;
    this.currentPdfBytes   = new Uint8Array(rawBuffer);
    this.thumbnails        = [];
    this.onSelectionChange = onSelectionChange;

    // Validate with pdf-lib using an isolated safe buffer
    var PDFDocument = window.PDFLib.PDFDocument;
    try {
      await PDFDocument.load(this.getSafeBuffer());
    } catch (err) {
      var msg = (err && err.message) ? err.message : '';
      if (msg.includes('password') || msg.includes('encrypt')) {
        throw new Error('This PDF is password-protected and cannot be edited.');
      }
      throw new Error('This file appears to be damaged or is not a valid PDF.');
    }

    // Render thumbnails with pdf.js using another isolated safe buffer
    showLoading(true, 'Rendering page thumbnails…');
    var result = await renderThumbnails(this.getSafeBuffer(), gridContainer, {
      selectable: true,
      onSelectionChange: onSelectionChange
    });
    this.thumbnails = result.thumbnails;
    return this.thumbnails.length;

  } finally {
    showLoading(false);
  }
};

/**
 * Deletes selected pages:
 * 1. Removes them from the PDF document in memory (descending order to avoid index shifting)
 * 2. Removes the corresponding thumbnail cards from the UI screen instantly
 * 3. Renumbers remaining pages in the UI
 * 4. Downloads the updated PDF
 */
Editor.prototype.deleteSelectedPages = async function() {
  clearError();
  var selected = this.getSelected();

  if (selected.length === 0) {
    showError('No pages selected. Click on thumbnails to select the pages you want to delete.');
    return;
  }

  if (!this.currentPdfBytes || this.currentPdfBytes.length === 0) {
    showError('No file loaded. Please upload a PDF first.');
    return;
  }

  var PDFDocument = window.PDFLib.PDFDocument;
  var safeBuffer  = this.getSafeBuffer();
  var pdfDoc      = await PDFDocument.load(safeBuffer);
  var totalPages  = pdfDoc.getPageCount();

  if (selected.length >= totalPages) {
    showError('Cannot delete all pages — the result would be empty. Please keep at least one page.');
    return;
  }

  showLoading(true, 'Deleting ' + selected.length + ' page(s)…');
  try {
    // ✅ CRITICAL: Sort descending so removing index N doesn't shift indices < N
    var sortedDesc = selected.slice().sort(function(a, b) { return b - a; });

    // 1. Remove pages from the in-memory PDF
    sortedDesc.forEach(function(i) {
      pdfDoc.removePage(i);
    });

    // 2. Save the modified PDF bytes as the new master state
    var newPdfBytes = await pdfDoc.save();
    this.currentPdfBytes = newPdfBytes;

    // 3. Update the UI: remove deleted thumbnail elements from the DOM and list
    var self = this;
    sortedDesc.forEach(function(i) {
      var item = self.thumbnails[i];
      if (item && item.parentNode) {
        item.parentNode.removeChild(item);
      }
      self.thumbnails.splice(i, 1);
    });

    // 4. Renumber all remaining thumbnails in the UI
    var remainingTotal = self.thumbnails.length;
    for (var k = 0; k < remainingTotal; k++) {
      var thumb = self.thumbnails[k];
      thumb.dataset.pageIndex = String(k);

      var label = thumb.querySelector('.thumb-label');
      if (label) label.textContent = 'Page ' + (k + 1);

      var img = thumb.querySelector('.thumb-img');
      if (img) img.alt = 'Page ' + (k + 1) + ' of ' + remainingTotal;

      thumb.classList.remove('selected');
      thumb.setAttribute('aria-checked', 'false');
    }

    // 5. Reset selection counter
    if (this.onSelectionChange) {
      this.onSelectionChange([]);
    }

    // 6. Download the edited file
    downloadBlob(newPdfBytes, 'edited.pdf');
    showToast('✅ Deleted ' + selected.length + ' page(s). (' + remainingTotal + ' pages remaining). Download started!');

  } catch (err) {
    showError('Failed to delete pages: ' + ((err && err.message) || 'Unknown error.'));
  } finally {
    showLoading(false);
  }
};

/**
 * Rotates selected pages 90 degrees CW or CCW:
 * 1. Rotates pages in the in-memory PDF
 * 2. Visually rotates the thumbnail images on screen
 * 3. Saves and downloads the updated PDF
 */
Editor.prototype.rotateSelectedPages = async function(degrees) {
  clearError();
  var selected = this.getSelected();

  if (selected.length === 0) {
    showError('No pages selected. Click on thumbnails to select the pages you want to rotate.');
    return;
  }

  if (!this.currentPdfBytes || this.currentPdfBytes.length === 0) {
    showError('No file loaded. Please upload a PDF first.');
    return;
  }

  showLoading(true, 'Rotating ' + selected.length + ' page(s)…');
  try {
    var PDFDocument = window.PDFLib.PDFDocument;
    var pdfDegrees  = window.PDFLib.degrees;
    var safeBuffer  = this.getSafeBuffer();
    var pdfDoc      = await PDFDocument.load(safeBuffer);
    var pages       = pdfDoc.getPages();

    var self = this;
    selected.forEach(function(index) {
      var page         = pages[index];
      var currentAngle = page.getRotation().angle;
      var newAngle     = ((currentAngle + degrees) % 360 + 360) % 360;
      page.setRotation(pdfDegrees(newAngle));

      // Visually rotate thumbnail on screen
      var thumb = self.thumbnails[index];
      if (thumb) {
        var img = thumb.querySelector('.thumb-img');
        if (img) {
          var curRot = parseInt(img.dataset.rotation || '0', 10);
          var nextRot = curRot + degrees;
          img.dataset.rotation = String(nextRot);
          img.style.transform  = 'rotate(' + nextRot + 'deg)';
          img.style.transition = 'transform 0.25s ease';
        }
      }
    });

    var newPdfBytes = await pdfDoc.save();
    this.currentPdfBytes = newPdfBytes;

    downloadBlob(newPdfBytes, 'edited.pdf');
    var dir = degrees > 0 ? 'clockwise' : 'counter-clockwise';
    showToast('✅ Rotated ' + selected.length + ' page(s) ' + dir + '. Download started!');

  } catch (err) {
    showError('Failed to rotate pages: ' + ((err && err.message) || 'Unknown error.'));
  } finally {
    showLoading(false);
  }
};

/**
 * Downloads the current PDF as-is.
 */
Editor.prototype.saveAndDownload = async function() {
  clearError();
  if (!this.currentPdfBytes || this.currentPdfBytes.length === 0) {
    showError('No file loaded. Please upload a PDF first.');
    return;
  }
  downloadBlob(this.currentPdfBytes, (this.currentFile && this.currentFile.name) || 'edited.pdf');
  showToast('✅ Download started!');
};
