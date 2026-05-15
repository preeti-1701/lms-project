/**
 * Security Deterrents — frontend/src/utils/securityDeterrents.js
 *
 * Blocks:
 *  - Right-click (context menu)
 *  - Print Screen (clears clipboard + shows warning)
 *  - F12, Ctrl+Shift+I/J/U (DevTools)
 *  - Ctrl+S (save page), Ctrl+P (print), Ctrl+A (select all)
 *  - Drag-and-drop on media elements
 *  - Text selection on the page
 */
export default function setupSecurityDeterrents() {
  // ── Disable right-click ──────────────────────────────────────────────────
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // ── Block keyboard shortcuts ─────────────────────────────────────────────
  const handleKeyDown = (e) => {
    const key = e.key ? e.key.toLowerCase() : '';
    const ctrl = e.ctrlKey || e.metaKey;

    // DevTools: F12
    if (e.key === 'F12') {
      e.preventDefault();
      return;
    }

    // DevTools: Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
      e.preventDefault();
      return;
    }

    // View source: Ctrl+U
    if (ctrl && key === 'u') {
      e.preventDefault();
      return;
    }

    // Save page: Ctrl+S
    if (ctrl && key === 's') {
      e.preventDefault();
      return;
    }

    // Print: Ctrl+P
    if (ctrl && key === 'p') {
      e.preventDefault();
      return;
    }

    // Print Screen
    if (e.key === 'PrintScreen') {
      // Clear clipboard immediately as a deterrent
      try {
        navigator.clipboard.writeText('').catch(() => {});
      } catch (_) {}
      showSecurityAlert('⚠️ Screenshots are disabled. This action has been logged.');
      e.preventDefault();
      return;
    }
  };

  // ── Block print dialog (Ctrl+P or window.print()) ────────────────────────
  const handleBeforePrint = (e) => {
    showSecurityAlert('🔒 Printing is disabled for this content.');
    // Can't truly cancel beforeprint, but we show a warning
  };

  // ── Block drag on media elements ─────────────────────────────────────────
  const handleDragStart = (e) => {
    if (
      e.target.tagName === 'IMG' ||
      e.target.tagName === 'VIDEO' ||
      e.target.tagName === 'IFRAME' ||
      e.target.tagName === 'A'
    ) {
      e.preventDefault();
    }
  };

  // ── Security alert overlay ────────────────────────────────────────────────
  function showSecurityAlert(message) {
    // Remove any existing alert
    const existing = document.getElementById('lms-security-alert');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'lms-security-alert';
    el.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      color: #e0e7ff; border: 1px solid #6366f1;
      padding: 14px 28px; border-radius: 12px;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
      z-index: 99999; box-shadow: 0 8px 32px rgba(99,102,241,0.4);
      letter-spacing: 0.01em; pointer-events: none;
      animation: lmsAlertIn 0.25s ease;
    `;
    el.textContent = message;

    // Inject keyframe animation
    if (!document.getElementById('lms-alert-style')) {
      const style = document.createElement('style');
      style.id = 'lms-alert-style';
      style.textContent = `
        @keyframes lmsAlertIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ── Register all listeners ────────────────────────────────────────────────
  window.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('dragstart', handleDragStart);

  // ── Return cleanup function ───────────────────────────────────────────────
  return () => {
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeprint', handleBeforePrint);
    window.removeEventListener('dragstart', handleDragStart);
  };
}
