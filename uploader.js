/**
 * uploader.js — File list management for the Merge tab (plain global script)
 * Depends on: utils.js
 */

var WARN_SIZE = 30  * 1024 * 1024;  // 30 MB — show a warning
var MAX_SIZE  = 200 * 1024 * 1024;  // 200 MB — reject the file

function Uploader(config) {
  this.files  = [];
  this.config = config;
  this._bindEvents();
}

Uploader.prototype.getFiles = function() { return this.files.slice(); };

Uploader.prototype.clearAll = function() { this.files = []; this._render(); };

Uploader.prototype._bindEvents = function() {
  var self      = this;
  var dropZone  = this.config.dropZone;
  var fileInput = this.config.fileInput;
  var inputMore = this.config.fileInputMore;

  // Primary file picker
  fileInput.addEventListener('change', function(e) {
    self._addFiles(e.target.files);
    e.target.value = '';
  });

  // "Add More" file picker
  if (inputMore) {
    inputMore.addEventListener('change', function(e) {
      self._addFiles(e.target.files);
      e.target.value = '';
    });
  }

  // Drag-and-drop
  dropZone.addEventListener('dragenter', function(e) { e.preventDefault(); });
  dropZone.addEventListener('dragover',  function(e) {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', function(e) {
    // Only remove the class when truly leaving the drop zone (not moving to a child)
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  });
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    self._addFiles(e.dataTransfer.files);
  });

  // Click anywhere on the drop zone opens the file picker —
  // but NOT if the click was on the <label> or the <input> itself
  dropZone.addEventListener('click', function(e) {
    var target = e.target;
    // Guard: closest() only exists on Element nodes, not text/comment nodes
    if (!(target instanceof Element)) return;
    if (target.closest('label') || target.tagName === 'INPUT') return;
    fileInput.click();
  });
};

Uploader.prototype._addFiles = function(fileList) {
  clearError();
  var added = 0;

  for (var i = 0; i < fileList.length; i++) {
    var file = fileList[i];

    if (!isPDF(file)) {
      showError('"' + file.name + '" is not a PDF. Only PDF files are supported.');
      continue;
    }
    if (file.size > MAX_SIZE) {
      showError('"' + file.name + '" is too large (' + formatBytes(file.size) + '). Maximum is 200 MB.');
      continue;
    }

    this.files.push(file);
    added++;
  }

  if (added > 0) this._render();
};

Uploader.prototype._render = function() {
  var dropZone          = this.config.dropZone;
  var fileList          = this.config.fileList;
  var fileListContainer = this.config.fileListContainer;
  var fileCount         = this.config.fileCount;

  if (this.files.length === 0) {
    fileListContainer.classList.add('hidden');
    dropZone.classList.remove('hidden');
    if (this.config.onFilesChange) this.config.onFilesChange([]);
    return;
  }

  dropZone.classList.add('hidden');
  fileListContainer.classList.remove('hidden');
  fileCount.textContent = String(this.files.length);

  fileList.innerHTML = '';
  var self = this;

  this.files.forEach(function(file, index) {
    var li = self._createFileItem(file, index);
    fileList.appendChild(li);
  });

  // Wire action buttons (remove / up / down)
  fileList.querySelectorAll('[data-action]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var action = btn.dataset.action;
      var idx    = parseInt(btn.dataset.index, 10);
      if      (action === 'remove') self._removeFile(idx);
      else if (action === 'up')     self._moveFile(idx, -1);
      else if (action === 'down')   self._moveFile(idx,  1);
    });
  });

  if (this.config.onFilesChange) this.config.onFilesChange(this.files.slice());
};

Uploader.prototype._createFileItem = function(file, index) {
  var isLarge = file.size > WARN_SIZE;
  var isFirst = index === 0;
  var isLast  = index === this.files.length - 1;

  var li = document.createElement('li');
  li.className = 'file-item';

  li.innerHTML =
    '<span class="file-drag-handle" aria-hidden="true" title="Drag to reorder">⠿</span>' +
    '<span class="file-icon" aria-hidden="true">📄</span>' +
    '<div class="file-info">' +
      '<div class="file-name" title="' + escHtml(file.name) + '">' + escHtml(file.name) + '</div>' +
      '<div class="file-meta">' +
        '<span>' + formatBytes(file.size) + '</span>' +
        (isLarge ? '<span class="file-warning">⚠️ Large file — may be slow</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="file-item-actions">' +
      '<button class="btn-icon" data-action="up"     data-index="' + index + '" aria-label="Move ' + escHtml(file.name) + ' up"   ' + (isFirst ? 'disabled' : '') + '>↑</button>' +
      '<button class="btn-icon" data-action="down"   data-index="' + index + '" aria-label="Move ' + escHtml(file.name) + ' down" ' + (isLast  ? 'disabled' : '') + '>↓</button>' +
      '<button class="btn-icon" data-action="remove" data-index="' + index + '" aria-label="Remove ' + escHtml(file.name) + '">✕</button>' +
    '</div>';

  return li;
};

Uploader.prototype._removeFile = function(index) {
  this.files.splice(index, 1);
  this._render();
};

Uploader.prototype._moveFile = function(index, dir) {
  var newIdx = index + dir;
  if (newIdx < 0 || newIdx >= this.files.length) return;
  var tmp            = this.files[index];
  this.files[index]  = this.files[newIdx];
  this.files[newIdx] = tmp;
  this._render();
};
