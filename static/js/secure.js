// Basic deterrents (not real security, just prevention)

// Disable right-click
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// Block PrintScreen
document.addEventListener('keyup', function(e) {
  if (e.key === 'PrintScreen') {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('');
    }
    alert('Screenshots are not allowed.');
  }
});

// Block common shortcuts (Ctrl+S, Ctrl+P, Ctrl+U)
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey || e.metaKey) {
    const key = e.key.toLowerCase();

    if (key === 's' || key === 'p' || key === 'u') {
      e.preventDefault();

      if (key === 's') alert('Save is disabled.');
      if (key === 'p') alert('Printing is disabled.');
      if (key === 'u') alert('View source is disabled.');
    }
  }
});
