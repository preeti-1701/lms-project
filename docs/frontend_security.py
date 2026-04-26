"""
Frontend Security Template
This file documents the frontend-side security features mentioned in requirements.
These would be implemented in your frontend framework (React, Vue, etc.)

IMPORTANT: All server-side security is already implemented in the Django backend.
Frontend security is a complementary layer only — it should never be the sole protection.
"""

# ═══════════════════════════════════════════════════════════
# DYNAMIC WATERMARK ON VIDEO PLAYER (JavaScript)
# Place this in your frontend video player component
# ═══════════════════════════════════════════════════════════
WATERMARK_JS = """
/**
 * LMS Video Watermark
 * Overlays user's email + timestamp on the video player.
 * Repositions every 5 seconds to prevent cropping around watermark.
 */
class VideoWatermark {
  constructor(containerEl, userEmail) {
    this.container = containerEl;
    this.userEmail = userEmail;
    this.watermark = null;
    this.interval = null;
    this._inject();
  }

  _inject() {
    // Create watermark element
    this.watermark = document.createElement('div');
    this.watermark.className = 'lms-watermark';
    this.watermark.style.cssText = `
      position: absolute;
      pointer-events: none;
      user-select: none;
      opacity: 0.35;
      color: white;
      font-size: 13px;
      font-family: monospace;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
      z-index: 9999;
      white-space: nowrap;
      transform: rotate(-20deg);
    `;

    this._updateContent();
    this._reposition();
    this.container.appendChild(this.watermark);

    // Reposition every 5 seconds
    this.interval = setInterval(() => {
      this._reposition();
      this._updateContent();
    }, 5000);
  }

  _updateContent() {
    const now = new Date().toLocaleString();
    this.watermark.textContent = `${this.userEmail} • ${now}`;
  }

  _reposition() {
    const maxX = Math.max(10, this.container.offsetWidth - 300);
    const maxY = Math.max(10, this.container.offsetHeight - 40);
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    this.watermark.style.left = `${x}px`;
    this.watermark.style.top = `${y}px`;
  }

  destroy() {
    if (this.interval) clearInterval(this.interval);
    if (this.watermark) this.watermark.remove();
  }
}

// Usage in React component:
// const wm = new VideoWatermark(videoContainerRef.current, user.email);
// return () => wm.destroy(); // cleanup
"""

# ═══════════════════════════════════════════════════════════
# DISABLE RIGHT-CLICK & KEYBOARD SHORTCUTS (JavaScript)
# ═══════════════════════════════════════════════════════════
SECURITY_JS = """
/**
 * LMS Content Protection
 * Disables right-click context menu and common screenshot shortcuts
 * on video container elements.
 *
 * NOTE: This is a deterrent only. Determined users can bypass browser
 * protections. The primary security layer is server-side (RBAC, session
 * management, embed-only URLs).
 */
function enableContentProtection(targetEl) {
  // Disable right-click
  targetEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable common download/screenshot key combos
  targetEl.addEventListener('keydown', (e) => {
    // Ctrl+S (save), Ctrl+P (print), Ctrl+U (view source)
    const blocked = (e.ctrlKey || e.metaKey) && ['s','p','u','a'].includes(e.key.toLowerCase());
    // F12 (dev tools), PrintScreen
    const blockedKeys = ['F12', 'PrintScreen'];
    if (blocked || blockedKeys.includes(e.key)) {
      e.preventDefault();
      return false;
    }
  });

  // Disable drag-and-drop of iframe content
  targetEl.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });
}

// CSS to disable text selection around player
const protectionCSS = `
  .lms-video-container {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: relative;
  }

  /* Transparent overlay to intercept right-clicks on iframe */
  .lms-video-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }
`;
"""

# ═══════════════════════════════════════════════════════════
# YOUTUBE EMBED CONFIGURATION (React/HTML)
# ═══════════════════════════════════════════════════════════
YOUTUBE_EMBED_HTML = """
<!-- 
  Secure YouTube Video Embed Template
  The backend provides embed_url — never expose the direct youtube_url to students.
  
  Security features applied via URL parameters:
  - rel=0         : No related videos (reduces navigation away)
  - modestbranding=1 : Minimal YouTube branding
  - fs=0          : No fullscreen button (reduces recording ease)
  - disablekb=1   : Disable keyboard shortcuts inside player
  - iv_load_policy=3 : No video annotations
  
  The embed_url comes from the API — never construct it on the frontend.
-->
<div class="lms-video-container" id="video-container">
  <iframe
    id="lms-player"
    src="{{ video.embed_url }}"
    width="100%"
    height="480"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen="false"
  ></iframe>
  <!-- Watermark is injected here by VideoWatermark class -->
</div>

<script>
  const container = document.getElementById('video-container');
  
  // Apply content protection
  enableContentProtection(container);
  
  // Inject watermark (userEmail comes from your auth state)
  const watermark = new VideoWatermark(container, currentUser.email);
</script>
"""
