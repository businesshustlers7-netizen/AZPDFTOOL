/**
 * thumbnails.js — Renders PDF page thumbnails using pdf.js
 * Depends on: utils.js (loaded before this file)
 * pdf.js is available as the global window.pdfjsLib (CDN script tag in index.html)
 *
 * ⚠️ Always pass a cloned ArrayBuffer (.slice(0)) — if the caller previously
 * passed the same buffer to pdf-lib, it may be neutered (byteLength === 0).
 * We defensively clone here as a safety net.
 */

var PDFJS_WORKER_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
var THUMB_WIDTH = 150;

/**
 * Renders all pages as thumbnails into `container`.
 * @param {ArrayBuffer} arrayBuffer
 * @param {HTMLElement} container
 * @param {object}      options
 * @param {boolean}     [options.selectable]
 * @param {function}    [options.onSelectionChange]
 * @returns {Promise<{ pdfProxy, thumbnails: HTMLElement[] }>}
 */
async function renderThumbnails(arrayBuffer, container, options) {
  options = options || {};
  var selectable        = options.selectable        || false;
  var onSelectionChange = options.onSelectionChange || null;

  // Guard: if the buffer was neutered by pdf-lib, clone it back from scratch is impossible.
  // The caller should pass a fresh .slice(0). Log a clear error if neutered.
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    console.error('[thumbnails.js] Received an empty or neutered ArrayBuffer. ' +
      'Make sure to pass buffer.slice(0) instead of the raw buffer after pdf-lib has loaded it.');
    throw new Error('Internal error: PDF buffer is empty. Please reload the file.');
  }

  // Set the Worker URL (must be done before getDocument)
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

  // Defensive clone in case the caller forgot to slice
  var safeBuffer = arrayBuffer.slice(0);

  var pdfProxy = await window.pdfjsLib.getDocument({ data: safeBuffer }).promise;
  var numPages = pdfProxy.numPages;

  container.innerHTML = '';
  var thumbnails = [];

  for (var pageNum = 1; pageNum <= numPages; pageNum++) {
    var page     = await pdfProxy.getPage(pageNum);
    var baseVP   = page.getViewport({ scale: 1 });
    var scale    = THUMB_WIDTH / baseVP.width;
    var scaledVP = page.getViewport({ scale: scale });

    var canvas    = document.createElement('canvas');
    canvas.width  = Math.round(scaledVP.width);
    canvas.height = Math.round(scaledVP.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaledVP }).promise;

    var dataUrl = canvas.toDataURL('image/jpeg', 0.72);

    var item = _createThumbElement(pageNum, dataUrl, numPages);
    item.dataset.pageIndex = String(pageNum - 1); // 0-indexed

    if (selectable) {
      _addSelectBehaviour(item, thumbnails, onSelectionChange);
    }

    container.appendChild(item);
    thumbnails.push(item);
  }

  return { pdfProxy: pdfProxy, thumbnails: thumbnails };
}

function getSelectedIndices(thumbnails) {
  return thumbnails
    .filter(function(t) { return t.classList.contains('selected'); })
    .map(function(t) { return parseInt(t.dataset.pageIndex, 10); });
}

function selectAll(thumbnails, onSelectionChange) {
  thumbnails.forEach(function(t) { _setSelected(t, true); });
  if (onSelectionChange) onSelectionChange(getSelectedIndices(thumbnails));
}

function deselectAll(thumbnails, onSelectionChange) {
  thumbnails.forEach(function(t) { _setSelected(t, false); });
  if (onSelectionChange) onSelectionChange([]);
}

// ---- private helpers ----

function _createThumbElement(pageNum, dataUrl, totalPages) {
  var item = document.createElement('div');
  item.className = 'thumb-item';
  item.setAttribute('tabindex', '0');

  var img       = document.createElement('img');
  img.src       = dataUrl;
  img.className = 'thumb-img';
  img.alt       = 'Page ' + pageNum + ' of ' + totalPages;
  img.draggable = false;

  var check = document.createElement('span');
  check.className   = 'thumb-check';
  check.setAttribute('aria-hidden', 'true');
  check.textContent = '✓';

  var label = document.createElement('div');
  label.className   = 'thumb-label';
  label.textContent = 'Page ' + pageNum;

  item.appendChild(img);
  item.appendChild(check);
  item.appendChild(label);
  return item;
}

function _addSelectBehaviour(item, thumbnails, onSelectionChange) {
  item.setAttribute('role', 'checkbox');
  item.setAttribute('aria-checked', 'false');
  item.setAttribute('aria-label', item.querySelector('.thumb-label').textContent);

  function toggle() {
    _setSelected(item, !item.classList.contains('selected'));
    if (onSelectionChange) onSelectionChange(getSelectedIndices(thumbnails));
  }

  item.addEventListener('click', toggle);
  item.addEventListener('keydown', function(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  });
}

function _setSelected(item, selected) {
  item.classList.toggle('selected', selected);
  item.setAttribute('aria-checked', selected ? 'true' : 'false');
}
