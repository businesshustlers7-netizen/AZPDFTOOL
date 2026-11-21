/**
 * main.js — App entry point for AZ PDF Toolkit (plain global script)
 * Depends on: utils.js, uploader.js, merger.js, editor.js, extractor.js, thumbnails.js
 * All loaded via <script> tags in index.html BEFORE this file.
 */

// ================================================================
//  1. DARK MODE
// ================================================================
(function() {
  var root        = document.documentElement;
  var toggleBtn   = document.getElementById('darkModeToggle');
  var savedTheme  = localStorage.getItem('az-theme') || 'light';

  root.setAttribute('data-theme', savedTheme);
  toggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  toggleBtn.addEventListener('click', function() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('az-theme', next);
    toggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
})();

// ================================================================
//  2. ERROR BANNER DISMISS
// ================================================================
document.getElementById('errorClose').addEventListener('click', clearError);

// ================================================================
//  3. TAB NAVIGATION
// ================================================================
var tabs   = document.querySelectorAll('.tab');
var panels = document.querySelectorAll('.tab-panel');

function switchTab(targetId) {
  clearError();
  tabs.forEach(function(tab) {
    var isActive = tab.dataset.tab === targetId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  panels.forEach(function(panel) {
    panel.classList.toggle('hidden', panel.id !== 'tab-' + targetId);
  });
}

tabs.forEach(function(tab) {
  tab.addEventListener('click', function() { switchTab(tab.dataset.tab); });
});

// ================================================================
//  4. MERGE TAB
// ================================================================
var uploader = new Uploader({
  dropZone:          document.getElementById('mergeDropZone'),
  fileInput:         document.getElementById('mergeFileInput'),
  fileInputMore:     document.getElementById('mergeFileInputMore'),
  fileList:          document.getElementById('mergeFileList'),
  fileListContainer: document.getElementById('mergeFileListContainer'),
  fileCount:         document.getElementById('mergeFileCount'),
  onFilesChange:     null
});

document.getElementById('mergeBtn').addEventListener('click', function() {
  mergePDFs(uploader.getFiles());
});

document.getElementById('mergeClear').addEventListener('click', function() {
  uploader.clearAll();
  clearError();
});

// ================================================================
//  5. EDIT PAGES TAB
// ================================================================
var editor = new Editor();

function onEditSelectionChange(selectedIndices) {
  var info = document.getElementById('selectionInfo');
  if (!info) return;
  var n = selectedIndices.length;
  info.textContent = n === 0 ? '0 pages selected' : n + ' page' + (n !== 1 ? 's' : '') + ' selected';
}

async function loadEditFile(file) {
  clearError();
  if (!isPDF(file)) { showError('Only PDF files are supported.'); return; }

  var grid      = document.getElementById('thumbnailGrid');
  var container = document.getElementById('editorContainer');
  var dropZone  = document.getElementById('editDropZone');
  var fileName  = document.getElementById('editFileName');

  container.classList.remove('hidden');
  dropZone.classList.add('hidden');
  fileName.textContent = file.name;
  fileName.title       = file.name;

  try {
    await editor.loadFile(file, grid, onEditSelectionChange);
    onEditSelectionChange([]);
  } catch (err) {
    showError(err.message);
    container.classList.add('hidden');
    dropZone.classList.remove('hidden');
  }
}

document.getElementById('editFileInput').addEventListener('change', async function(e) {
  var file = e.target.files[0];
  if (file) await loadEditFile(file);
  e.target.value = '';
});

setupDropZone(
  document.getElementById('editDropZone'),
  document.getElementById('editFileInput'),
  function(file) { loadEditFile(file); }
);

document.getElementById('editLoadAnother').addEventListener('click', function() {
  document.getElementById('editorContainer').classList.add('hidden');
  document.getElementById('editDropZone').classList.remove('hidden');
  document.getElementById('thumbnailGrid').innerHTML = '';
  onEditSelectionChange([]);
  clearError();
});

document.getElementById('selectAllBtn').addEventListener('click',   function(){ editor.selectAll(onEditSelectionChange); });
document.getElementById('deselectAllBtn').addEventListener('click', function(){ editor.deselectAll(onEditSelectionChange); });
document.getElementById('deleteBtn').addEventListener('click',      function(){ editor.deleteSelectedPages(); });
document.getElementById('rotateRightBtn').addEventListener('click', function(){ editor.rotateSelectedPages(90); });
document.getElementById('rotateLeftBtn').addEventListener('click',  function(){ editor.rotateSelectedPages(-90); });
document.getElementById('saveEditBtn').addEventListener('click',    function(){ editor.saveAndDownload(); });

// ================================================================
//  6. EXTRACT TAB
// ================================================================
var extractor = new Extractor();

async function loadExtractFile(file) {
  clearError();
  if (!isPDF(file)) { showError('Only PDF files are supported.'); return; }

  var container  = document.getElementById('extractContainer');
  var dropZone   = document.getElementById('extractDropZone');
  var fileNameEl = document.getElementById('extractFileName');
  var pageCount  = document.getElementById('extractPageCount');
  var rangeInput = document.getElementById('rangeInput');

  try {
    var total = await extractor.loadFile(file);
    fileNameEl.textContent  = file.name;
    fileNameEl.title        = file.name;
    pageCount.textContent   = String(total);
    rangeInput.value        = '';
    container.classList.remove('hidden');
    dropZone.classList.add('hidden');
    rangeInput.focus();
  } catch (err) {
    showError(err.message);
  }
}

document.getElementById('extractFileInput').addEventListener('change', async function(e) {
  var file = e.target.files[0];
  if (file) await loadExtractFile(file);
  e.target.value = '';
});

setupDropZone(
  document.getElementById('extractDropZone'),
  document.getElementById('extractFileInput'),
  function(file) { loadExtractFile(file); }
);

document.getElementById('extractLoadAnother').addEventListener('click', function() {
  document.getElementById('extractContainer').classList.add('hidden');
  document.getElementById('extractDropZone').classList.remove('hidden');
  clearError();
});

document.getElementById('extractBtn').addEventListener('click', function() {
  extractor.extractPages(document.getElementById('rangeInput').value);
});

document.getElementById('rangeInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') extractor.extractPages(e.target.value);
});

// ================================================================
//  SHARED: Drop zone setup helper
// ================================================================
function setupDropZone(dropZone, fileInput, onFile) {
  dropZone.addEventListener('dragenter', function(e){ e.preventDefault(); });
  dropZone.addEventListener('dragover',  function(e){
    e.preventDefault(); dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', function(e){
    if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', function(e){
    e.preventDefault(); dropZone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file) onFile(file);
  });
  dropZone.addEventListener('click', function(e){
    if (e.target.closest('label') || e.target.tagName === 'INPUT') return;
    fileInput.click();
  });
}
