/**
 * utils.js — Shared utility functions (plain global script, no ES modules)
 * Loaded first; all functions go on window so other scripts can use them.
 */

// ---- Download ----
function downloadBlob(data, filename) {
  const blob = data instanceof Blob
    ? data
    : new Blob([data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ---- Error banner ----
function showError(message) {
  const banner = document.getElementById('errorBanner');
  const msg    = document.getElementById('errorMsg');
  if (!banner || !msg) return;
  msg.textContent = message;
  banner.classList.remove('hidden');
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearError() {
  const banner = document.getElementById('errorBanner');
  if (banner) banner.classList.add('hidden');
}

// ---- Toast ----
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ---- Loading overlay ----
function showLoading(visible, message) {
  message = message || 'Processing…';
  const overlay = document.getElementById('loadingOverlay');
  const msg     = document.getElementById('loadingMsg');
  if (!overlay) return;
  if (visible) {
    if (msg) msg.textContent = message;
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

// ---- Formatting ----
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  var units = ['B', 'KB', 'MB', 'GB'];
  var exp   = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, exp)).toFixed(1) + ' ' + units[exp];
}

function isPDF(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// ---- Page range parser ----
// Converts "1-3, 5" (1-indexed user input) to [0,1,2,4] (0-indexed for pdf-lib)
function parseRange(rangeStr, totalPages) {
  if (!rangeStr || !rangeStr.trim()) {
    return { pages: [], error: 'Please enter a page range (e.g. 1-3, 5).' };
  }
  var pages = new Set();
  var parts = rangeStr.split(',');
  for (var i = 0; i < parts.length; i++) {
    var trimmed = parts[i].trim();
    if (!trimmed) continue;

    var rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      var start = parseInt(rangeMatch[1], 10);
      var end   = parseInt(rangeMatch[2], 10);
      if (start > end)       return { pages: [], error: 'Invalid range "' + trimmed + '": start must be ≤ end.' };
      if (start < 1)         return { pages: [], error: 'Page numbers start at 1.' };
      if (end > totalPages)  return { pages: [], error: 'Page ' + end + ' does not exist. This PDF has ' + totalPages + ' pages.' };
      for (var p = start; p <= end; p++) pages.add(p - 1);
      continue;
    }

    var singleMatch = trimmed.match(/^(\d+)$/);
    if (singleMatch) {
      var page = parseInt(singleMatch[1], 10);
      if (page < 1)          return { pages: [], error: 'Page numbers start at 1.' };
      if (page > totalPages) return { pages: [], error: 'Page ' + page + ' does not exist. This PDF has ' + totalPages + ' pages.' };
      pages.add(page - 1);
      continue;
    }

    return { pages: [], error: '"' + trimmed + '" is not a valid page number or range. Use a format like 1-3, 5.' };
  }
  if (pages.size === 0) return { pages: [], error: 'No valid pages found in the range you entered.' };
  return { pages: Array.from(pages).sort(function(a,b){return a-b;}), error: null };
}

// ---- HTML escaping (prevent XSS in innerHTML) ----
function escHtml(str) {
  return str
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
