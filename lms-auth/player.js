/* ════════════════════════════════════════════════════════
   EduVerse LMS – player.js
   Secure video player: YouTube IFrame API, watermark,
   progress tracking, notes, right-click blocking
   ════════════════════════════════════════════════════════ */

let SESSION    = null;
let ytPlayer   = null;
let progressSaveInterval = null;
let watermarkInterval    = null;

// Parsed from URL
let courseId   = null;
let vidIndex   = 0;
let currentCourse = null;
let currentVideo  = null;

/* ═══════════════════════════════════
   INIT
═══════════════════════════════════ */
(function init() {
  SESSION = sessionGuard(['student', 'trainer', 'admin']);
  if (!SESSION) return;

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  courseId = params.get('course');
  vidIndex = parseInt(params.get('vid') || '0', 10);

  if (!courseId) {
    window.location.href = 'student-dashboard.html';
    return;
  }

  currentCourse = getCourses().find(c => c.id === courseId);
  if (!currentCourse) {
    window.location.href = 'student-dashboard.html';
    return;
  }

  if (vidIndex < 0 || vidIndex >= currentCourse.videos.length) vidIndex = 0;
  currentVideo = currentCourse.videos[vidIndex];

  renderUserInfo(SESSION);
  renderPageMeta();
  renderSidebar();
  loadNotes();
  initSecurity();
  initWatermark();

  // Dynamically load YouTube IFrame API
  loadYouTubeApi();
})();

/* ═══════════════════════════════════
   PAGE META
═══════════════════════════════════ */
function renderPageMeta() {
  document.title = `${currentVideo.title} – EduVerse`;

  setElText('topbarCourse',  currentCourse.title);
  setElText('videoTitle',    currentVideo.title);
  setElText('courseName',    currentCourse.title);
  setElText('trainerName',   currentCourse.trainerName);
  setElText('videoDuration', currentVideo.duration || '—');
  setElText('videoIndex',    vidIndex + 1);
  setElText('videoTotal',    currentCourse.videos.length);

  // Update backLink based on role
  const back = document.getElementById('backLink');
  if (back) {
    const map = { student:'student-dashboard.html', trainer:'trainer-dashboard.html', admin:'admin-dashboard.html' };
    back.href = map[SESSION.role] || 'student-dashboard.html';
  }

  // Nav/prev buttons
  updateNavButtons();

  // Video progress
  updateVideoProgress();

  // Course progress in sidebar
  updateCourseProgress();
}

function setElText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function updateNavButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.disabled = vidIndex === 0;
  if (nextBtn) nextBtn.disabled = vidIndex === currentCourse.videos.length - 1;
}

function updateVideoProgress() {
  const prog = getProgress();
  const pct  = prog[SESSION.userId]?.[courseId]?.[currentVideo.id] || 0;
  const fill = document.getElementById('videoProgressFill');
  const pctEl= document.getElementById('videoProgressPct');
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
}

function updateCourseProgress() {
  const pct  = getCourseProgress(SESSION.userId, courseId);
  const fill = document.getElementById('sidebarProgressFill');
  const pctEl= document.getElementById('sidebarProgressPct');
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
}

/* ═══════════════════════════════════
   SIDEBAR (video list)
═══════════════════════════════════ */
function renderSidebar() {
  const courseEl = document.getElementById('sidebarCourse');
  const countEl  = document.getElementById('sidebarVideoCount');
  if (courseEl) courseEl.textContent = currentCourse.title;
  if (countEl)  countEl.textContent  = `${currentCourse.videos.length} videos`;

  const list = document.getElementById('vidList');
  if (!list) return;

  const prog = getProgress();
  list.innerHTML = [...currentCourse.videos]
    .sort((a, b) => a.order - b.order)
    .map((v, i) => {
      const pct  = prog[SESSION.userId]?.[courseId]?.[v.id] || 0;
      const done = pct >= 80;
      const active = i === vidIndex;
      return `
        <div class="vid-item ${active ? 'active' : ''} ${done && !active ? 'done' : ''}"
             onclick="navigateTo(${i})" id="vid-item-${i}">
          <div class="vid-num">${active ? '▶' : done ? '✓' : v.order}</div>
          <div class="vid-item-info">
            <div class="vid-item-title">${v.title}</div>
            <div class="vid-item-dur">${v.duration || '—'}</div>
          </div>
          ${done && !active ? `<svg class="vid-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
        </div>`;
    }).join('');

  // Scroll active item into view
  setTimeout(() => {
    const activeEl = document.getElementById(`vid-item-${vidIndex}`);
    if (activeEl) activeEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 300);
}

/* ═══════════════════════════════════
   YOUTUBE IFRAME API
═══════════════════════════════════ */
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }
  const tag = document.createElement('script');
  tag.src   = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  const container = document.getElementById('ytPlayerContainer');
  if (!container) return;

  // Create inner div for YT player
  const div = document.createElement('div');
  div.id = 'ytPlayer';
  container.appendChild(div);

  ytPlayer = new YT.Player('ytPlayer', {
    height:  '100%',
    width:   '100%',
    videoId: currentVideo.youtubeId,
    playerVars: {
      autoplay:       1,
      modestbranding: 1,
      rel:            0,
      disablekb:      0,
      controls:       1,
      iv_load_policy: 3,  // remove annotations
      cc_load_policy: 0,
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady(event) {
  startProgressTracking();
  createWatermark(SESSION.name || SESSION.email || 'EduVerse User');
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    saveProgress(100);
    updateVideoProgress();
    updateCourseProgress();
    renderSidebar();
    showToast('Video completed! Great job 🎉', 'success');
    // Auto-advance after 2s
    if (vidIndex < currentCourse.videos.length - 1) {
      setTimeout(() => navigateVideo(1), 2000);
    }
  }
}

function startProgressTracking() {
  clearInterval(progressSaveInterval);
  progressSaveInterval = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;
    const current  = ytPlayer.getCurrentTime();
    const duration = ytPlayer.getDuration();
    if (!duration) return;
    const pct = Math.min(100, Math.round((current / duration) * 100));
    saveProgress(pct);
    updateVideoProgress();
    updateCourseProgress();
  }, 8000);
}

function saveProgress(pct) {
  if (!SESSION.userId || !courseId || !currentVideo) return;
  const prog = getProgress();
  if (!prog[SESSION.userId]) prog[SESSION.userId] = {};
  if (!prog[SESSION.userId][courseId]) prog[SESSION.userId][courseId] = {};
  const existing = prog[SESSION.userId][courseId][currentVideo.id] || 0;
  prog[SESSION.userId][courseId][currentVideo.id] = Math.max(existing, pct);
  saveProgress_data(prog);
}
// Alias to avoid naming conflict with dashboard.js
function saveProgress_data(d) { localStorage.setItem('lms_progress', JSON.stringify(d)); }

/* ═══════════════════════════════════
   NAVIGATION
═══════════════════════════════════ */
window.navigateVideo = function (dir) {
  navigateTo(vidIndex + dir);
};

window.navigateTo = function (idx) {
  if (idx < 0 || idx >= currentCourse.videos.length) return;
  window.location.href = `video-player.html?course=${courseId}&vid=${idx}`;
};

window.markVideoComplete = function () {
  saveProgress(100);
  updateVideoProgress();
  updateCourseProgress();
  renderSidebar();
  showToast('Marked as complete! ✅', 'success');
  const btn = document.getElementById('markDoneBtn');
  if (btn) { btn.textContent = '✅ Completed'; btn.disabled = true; btn.style.opacity='0.6'; }
};

/* ═══════════════════════════════════
   NOTES
═══════════════════════════════════ */
function loadNotes() {
  const notes = getNotes();
  const key   = `${SESSION.userId}_${courseId}_${currentVideo?.id}`;
  const area  = document.getElementById('notesArea');
  if (area) area.value = notes[key] || '';

  // Auto-save notes on input
  if (area) {
    let notesTimer = null;
    area.addEventListener('input', () => {
      clearTimeout(notesTimer);
      notesTimer = setTimeout(() => saveNotes(true), 1500);
    });
  }
}

window.saveNotes = function (silent = false) {
  const area = document.getElementById('notesArea');
  if (!area) return;
  const notes = getNotes();
  const key   = `${SESSION.userId}_${courseId}_${currentVideo?.id}`;
  notes[key]  = area.value;
  saveNotes_data(notes);
  if (!silent) showToast('Notes saved! 📝', 'success');
};
function saveNotes_data(d) { localStorage.setItem('lms_notes', JSON.stringify(d)); }

/* ═══════════════════════════════════
   SECURITY
═══════════════════════════════════ */
function initSecurity() {
  // Right-click on overlay
  const overlay = document.getElementById('playerOverlay');
  if (overlay) {
    overlay.addEventListener('contextmenu', e => {
      e.preventDefault();
      showToast('Right-click is disabled in the player area.', 'warning');
    });
  }

  // Right-click on entire page (player wrapper)
  document.addEventListener('contextmenu', e => {
    if (e.target.closest('.player-wrapper')) {
      e.preventDefault();
      showToast('Right-click is disabled for security.', 'warning');
    }
  });

  // PrintScreen / keyboard captures
  document.addEventListener('keydown', e => {
    if (e.key === 'PrintScreen' || e.key === 'F13') {
      e.preventDefault();
      flashWatermarkEffect();
      showToast('Screenshot capture is not allowed.', 'warning');
    }
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      showToast('Printing is disabled on this platform.', 'warning');
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) {
      e.preventDefault();
    }
    if (e.key === 'F12') {
      e.preventDefault();
      showToast('Developer tools are restricted.', 'warning');
    }
  });

  // Disable drag
  document.addEventListener('dragstart', e => e.preventDefault());

  // Disable text selection in player
  const wrapper = document.getElementById('playerWrapper');
  if (wrapper) {
    wrapper.addEventListener('selectstart', e => e.preventDefault());
  }
}

/* ═══════════════════════════════════
   WATERMARK
═══════════════════════════════════ */
function initWatermark() {
  const el = document.getElementById('watermarkEl');
  if (!el) return;
  el.textContent = `${SESSION.name || SESSION.email} • EduVerse`;
  moveWatermarkEl(el);
  watermarkInterval = setInterval(() => moveWatermarkEl(el), 18000);
}

function moveWatermarkEl(el) {
  const parent = el.parentElement;
  if (!parent) return;
  const pw = parent.offsetWidth  || 640;
  const ph = parent.offsetHeight || 360;
  const positions = [
    [pw*0.05, ph*0.05], [pw*0.45, ph*0.1], [pw*0.1, ph*0.5],
    [pw*0.5, ph*0.55], [pw*0.2, ph*0.75], [pw*0.6, ph*0.3],
  ];
  const [x, y] = positions[Math.floor(Math.random() * positions.length)];
  el.style.left    = x + 'px';
  el.style.top     = y + 'px';
  el.style.opacity = (0.07 + Math.random() * 0.07).toString();
}

function flashWatermarkEffect() {
  const el = document.getElementById('watermarkEl');
  if (!el) return;
  el.style.transition = 'none';
  el.style.opacity    = '0.55';
  el.style.fontSize   = '1.4rem';
  el.style.left       = '50%';
  el.style.top        = '50%';
  el.style.transform  = 'translate(-50%,-50%) rotate(-25deg)';
  setTimeout(() => {
    el.style.transition = 'all 1.5s ease';
    el.style.opacity    = '0.1';
    el.style.fontSize   = '0.9rem';
    el.style.transform  = 'rotate(-25deg)';
    moveWatermarkEl(el);
  }, 2000);
}

/* ═══════════════════════════════════
   CLEANUP on page unload
═══════════════════════════════════ */
window.addEventListener('beforeunload', () => {
  clearInterval(progressSaveInterval);
  clearInterval(watermarkInterval);
  // Final progress save
  if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
    try {
      const current  = ytPlayer.getCurrentTime();
      const duration = ytPlayer.getDuration();
      if (duration > 0) {
        const pct = Math.min(100, Math.round((current / duration) * 100));
        saveProgress(pct);
      }
    } catch(e) { /* ignore */ }
  }
});
