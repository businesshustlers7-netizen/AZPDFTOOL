/**
 * merger.js — Merges multiple PDFs into one using pdf-lib (plain global script)
 * Depends on: utils.js
 * pdf-lib is available as window.PDFLib (CDN script tag in index.html)
 */

async function mergePDFs(files) {
  clearError();

  if (!files || files.length < 2) {
    showError('Please add at least 2 PDF files to merge.');
    return;
  }

  showLoading(true, 'Merging ' + files.length + ' PDFs…');

  try {
    var PDFDocument = window.PDFLib.PDFDocument;
    var mergedDoc   = await PDFDocument.create();

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      showLoading(true, 'Processing file ' + (i+1) + ' of ' + files.length + ': ' + file.name);

      var arrayBuffer = await file.arrayBuffer();
      var srcDoc;
      try {
        srcDoc = await PDFDocument.load(arrayBuffer);
      } catch (err) {
        var msg = (err && err.message) ? err.message : '';
        if (msg.includes('password') || msg.includes('encrypt')) {
          throw new Error('"' + file.name + '" is password-protected and cannot be merged.');
        }
        throw new Error('"' + file.name + '" appears to be damaged or is not a valid PDF.');
      }

      var pageCount   = srcDoc.getPageCount();
      var indices     = Array.from({ length: pageCount }, function(_, i){ return i; });
      var copiedPages = await mergedDoc.copyPages(srcDoc, indices);
      copiedPages.forEach(function(page){ mergedDoc.addPage(page); });
    }

    showLoading(true, 'Saving merged PDF…');
    var mergedBytes = await mergedDoc.save();
    downloadBlob(mergedBytes, 'merged.pdf');
    showToast('✅ Merged PDF downloaded!');

  } catch (err) {
    showError((err && err.message) ? err.message : 'Failed to merge PDFs. Please try again.');
  } finally {
    showLoading(false);
  }
}
