/* ════════════════════════════════════════════════════════
   EduVerse LMS – student.js
   Student dashboard logic
   ════════════════════════════════════════════════════════ */

let SESSION = null;

(function init() {
  SESSION = sessionGuard(['student']);
  if (!SESSION) return;

  renderUserInfo(SESSION);
  initSidebarNav();
  initModals();
  setGreeting();
  renderStats();
  renderContinueWatching();
  renderCourseGrids();
  renderProgressTable();
  renderCertificates();
  loadSettings();
})();

/* ── Greeting ── */
function setGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const name = (SESSION.name || 'Student').split(' ')[0];
  const el = document.getElementById('greetingTitle');
  if (el) el.textContent = `${greet}, ${name}! 👋`;
}

/* ── Stats ── */
function renderStats() {
  const users   = getUsers();
  const me      = users.find(u => u.id === SESSION.userId) || { enrolledCourses: [] };
  const enrolled = (me.enrolledCourses || []);
  const courses  = getCourses();

  document.getElementById('statEnrolled').textContent = enrolled.length;
  document.getElementById('courseCountBadge').textContent = enrolled.length;

  // Avg completion
  let totalPct = 0;
  let videosWatched = 0;
  let certCount = 0;

  enrolled.forEach(cId => {
    const pct = getCourseProgress(SESSION.userId, cId);
    totalPct += pct;
    if (pct === 100) certCount++;

    // Count watched videos
    const prog = getProgress()[SESSION.userId]?.[cId] || {};
    const c    = courses.find(c => c.id === cId);
    if (c) {
      c.videos.forEach(v => { if ((prog[v.id] || 0) >= 50) videosWatched++; });
    }
  });

  const avgPct = enrolled.length ? Math.round(totalPct / enrolled.length) : 0;
  document.getElementById('statCompletion').textContent = avgPct + '%';
  document.getElementById('statVideos').textContent     = videosWatched;
  document.getElementById('statCerts').textContent      = certCount;
}

/* ── Continue Watching ── */
function renderContinueWatching() {
  const container = document.getElementById('continueWatchingContainer');
  if (!container) return;

  const users   = getUsers();
  const me      = users.find(u => u.id === SESSION.userId) || { enrolledCourses: [] };
  const enrolled = (me.enrolledCourses || []);
  const courses  = getCourses();

  // Find the most recently started (not complete) course
  let best = null, bestPct = -1;
  enrolled.forEach(cId => {
    const pct = getCourseProgress(SESSION.userId, cId);
    if (pct > 0 && pct < 100 && pct > bestPct) {
      bestPct = pct;
      best    = courses.find(c => c.id === cId);
    }
  });

  if (!best) {
    // Find first enrolled course
    best = enrolled.length ? courses.find(c => c.id === enrolled[0]) : null;
    bestPct = 0;
  }

  if (!best) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🎬</div><p>No courses assigned yet. Contact your admin.</p></div>';
    return;
  }

  const lastVid = getLastWatchedVideo(SESSION.userId, best.id);
  const vidIdx  = lastVid ? best.videos.findIndex(v => v.id === lastVid.id) + 1 : 1;

  container.innerHTML = `
    <div class="continue-card" onclick="openVideo('${best.id}', 0)">
      <div class="continue-thumb" style="background:${best.color}">${best.icon || '📖'}</div>
      <div class="continue-info">
        <div class="continue-label">▶ Continue Where You Left Off</div>
        <div class="continue-title">${best.title}</div>
        <div class="continue-sub">${lastVid ? lastVid.title : best.videos[0]?.title || 'Video 1'} · Video ${vidIdx} of ${best.videos.length}</div>
        <div class="continue-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${bestPct}%"></div></div>
          <span class="continue-pct">${bestPct}%</span>
        </div>
      </div>
      <button class="btn-play-continue" aria-label="Play">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
    </div>`;
}

/* ── Course Grids ── */
function renderCourseGrids() {
  const users   = getUsers();
  const me      = users.find(u => u.id === SESSION.userId) || { enrolledCourses: [] };
  const enrolled = (me.enrolledCourses || []);
  const courses  = getCourses().filter(c => enrolled.includes(c.id));

  renderCourseCards(courses, 'overviewCoursesGrid', 3);
  renderCourseCards(courses, 'allCoursesGrid', 99);
}

function renderCourseCards(courses, containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!courses.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><p>No courses assigned yet.</p></div>';
    return;
  }

  const shown = courses.slice(0, limit);
  container.innerHTML = shown.map(course => {
    const pct = getCourseProgress(SESSION.userId, course.id);
    const done = pct === 100;
    return `
      <div class="course-card" onclick="openVideo('${course.id}', 0)">
        <div class="course-thumb" style="background:${course.color}">
          <div class="course-thumb-inner">${course.icon || '📖'}</div>
          <div class="course-thumb-overlay">
            <div class="play-btn-overlay">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
          <span class="course-cat-tag">${course.category}</span>
          <span class="course-video-count">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            ${course.videos.length}
          </span>
        </div>
        <div class="course-body">
          <div class="course-title">${course.title}</div>
          <div class="course-trainer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${course.trainerName}
          </div>
          <div class="course-progress-row">
            <div class="course-progress-label">
              <span>${done ? '✅ Complete' : 'Progress'}</span>
              <span>${pct}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${done ? 'complete' : ''}" style="width:${pct}%"></div>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── Progress Table ── */
function renderProgressTable() {
  const tbody = document.getElementById('progressTableBody');
  if (!tbody) return;

  const users   = getUsers();
  const me      = users.find(u => u.id === SESSION.userId) || { enrolledCourses: [] };
  const enrolled = (me.enrolledCourses || []);
  const courses  = getCourses().filter(c => enrolled.includes(c.id));

  if (!courses.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No courses enrolled.</td></tr>';
    return;
  }

  tbody.innerHTML = courses.map(course => {
    const pct     = getCourseProgress(SESSION.userId, course.id);
    const prog    = getProgress()[SESSION.userId]?.[course.id] || {};
    const watched = course.videos.filter(v => (prog[v.id] || 0) >= 50).length;
    const status  = pct === 100 ? '<span class="badge badge-success">✅ Completed</span>'
                  : pct > 0    ? '<span class="badge badge-primary">🔄 In Progress</span>'
                  :               '<span class="badge badge-muted">Not Started</span>';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:8px;background:${course.color};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${course.icon || '📖'}</div>
            <div><div style="font-weight:600;font-size:0.87rem;">${course.title}</div><div style="font-size:0.72rem;color:var(--text-muted);">${course.category}</div></div>
          </div>
        </td>
        <td style="font-size:0.83rem;">${course.trainerName}</td>
        <td style="font-size:0.83rem;">${watched} / ${course.videos.length}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="mini-progress"><div class="mini-progress-fill" style="width:${pct}%"></div></div>
            <span style="font-size:0.78rem;font-weight:700;color:var(--primary);min-width:30px;">${pct}%</span>
          </div>
        </td>
        <td>${status}</td>
      </tr>`;
  }).join('');
}

/* ── Certificates ── */
function renderCertificates() {
  const container = document.getElementById('certsGrid');
  if (!container) return;

  const users    = getUsers();
  const me       = users.find(u => u.id === SESSION.userId) || { enrolledCourses: [] };
  const enrolled = (me.enrolledCourses || []);
  const courses  = getCourses().filter(c => enrolled.includes(c.id) && getCourseProgress(SESSION.userId, c.id) === 100);

  if (!courses.length) {
    container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🏆</div><p>Complete a course to earn a certificate!</p></div>';
    return;
  }

  container.innerHTML = courses.map(c => `
    <div class="course-card" style="cursor:default;">
      <div class="course-thumb" style="background:${c.color}">
        <div class="course-thumb-inner">${c.icon || '🏆'}</div>
        <span class="course-cat-tag">Completed</span>
      </div>
      <div class="course-body">
        <div class="course-title">${c.title}</div>
        <div class="course-trainer">${c.trainerName}</div>
        <div style="margin-top:12px;">
          <button class="btn-primary" style="width:100%;justify-content:center;" onclick="downloadCert('${c.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Certificate
          </button>
        </div>
      </div>
    </div>`).join('');
}

/* ── Settings ── */
function loadSettings() {
  const users = getUsers();
  const me    = users.find(u => u.id === SESSION.userId);
  if (!me) return;
  const nameEl  = document.getElementById('settingName');
  const emailEl = document.getElementById('settingEmail');
  if (nameEl)  nameEl.value  = me.name  || '';
  if (emailEl) emailEl.value = me.email || '';
}

window.saveSettings = function () {
  showToast('Settings saved! ✅', 'success');
};

window.downloadCert = function (courseId) {
  const c = getCourses().find(c => c.id === courseId);
  showToast(`Certificate for "${c?.title || 'Course'}" downloading… (demo mode)`, 'info');
};

/* ── Open Video ── */
window.openVideo = function (courseId, videoIndex) {
  window.location.href = `video-player.html?course=${courseId}&vid=${videoIndex}`;
};
