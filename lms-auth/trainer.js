/* ════════════════════════════════════════════════════════
   EduVerse LMS – trainer.js
   Trainer dashboard logic
   ════════════════════════════════════════════════════════ */

let SESSION = null;

(function init() {
  SESSION = sessionGuard(['trainer']);
  if (!SESSION) return;

  renderUserInfo(SESSION);
  initSidebarNav();
  initModals();
  renderTrainerStats();
  renderTrainerCourses('tOverviewCourses', 2);
  renderTrainerCourses('tCoursesList', 99);
  renderStudentTable();
  renderAnalytics();
  loadTrainerSettings();
  initCourseForm();
  initVideoForm();
})();

/* ────────────────────── Stats ────────────────────── */
function getMyCoursesData() {
  return getCourses().filter(c => c.trainerId === SESSION.userId);
}

function renderTrainerStats() {
  const myCourses = getMyCoursesData();
  const totalStudents = myCourses.reduce((a, c) => a + c.enrolledCount, 0);
  const totalVideos   = myCourses.reduce((a, c) => a + c.videos.length, 0);

  document.getElementById('tStatCourses').textContent  = myCourses.length;
  document.getElementById('tStatStudents').textContent = totalStudents;
  document.getElementById('tStatVideos').textContent   = totalVideos;
  document.getElementById('tStatRate').textContent     = myCourses.length ? calcAvgCompletion() + '%' : '—';
}

function calcAvgCompletion() {
  const myCourses = getMyCoursesData();
  const progress  = getProgress();
  const users     = getUsers();
  const students  = users.filter(u => u.role === 'student');
  let total = 0, count = 0;

  myCourses.forEach(course => {
    students.forEach(s => {
      if ((s.enrolledCourses || []).includes(course.id)) {
        total += getCourseProgress(s.id, course.id);
        count++;
      }
    });
  });
  return count ? Math.round(total / count) : 0;
}

/* ────────────────────── Course Cards ────────────────────── */
function renderTrainerCourses(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const myCourses = getMyCoursesData().slice(0, limit);

  if (!myCourses.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:40px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);text-align:center;">
        <div class="empty-icon">📚</div>
        <p>You haven't created any courses yet.</p>
        <button class="btn-primary" style="margin-top:14px;" data-modal-open="addCourseModal">Create First Course</button>
      </div>`;
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
    });
    return;
  }

  container.innerHTML = myCourses.map(course => buildCourseManageCard(course)).join('');
  attachCourseCardEvents();
}

function buildCourseManageCard(course) {
  const studCount = getUsers().filter(u => u.role === 'student' && (u.enrolledCourses||[]).includes(course.id)).length;
  return `
    <div class="course-manage-card" data-course-id="${course.id}">
      <div class="course-manage-head" onclick="toggleCourseAccordion('${course.id}')">
        <div class="course-manage-icon" style="background:${course.color}">${course.icon||'📖'}</div>
        <div class="course-manage-info">
          <div class="course-manage-title">${course.title}</div>
          <div class="course-manage-meta">
            <span>📁 ${course.category}</span>
            <span>🎬 ${course.videos.length} videos</span>
            <span>👥 ${studCount} students</span>
            <span>📅 ${formatDate(course.createdAt)}</span>
          </div>
        </div>
        <div class="course-manage-actions">
          <button class="btn-sm btn-sm-primary" onclick="event.stopPropagation();openAddVideoModal('${course.id}')" title="Add video">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Video
          </button>
          <button class="btn-sm btn-sm-danger" onclick="event.stopPropagation();deleteCourse('${course.id}')" title="Delete course">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
          <svg class="chevron-icon" style="color:var(--text-muted);transition:transform var(--transition)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="video-manage-list" id="accordion-${course.id}" style="display:none;">
        ${buildVideoList(course)}
        <div class="add-video-row">
          <button class="btn-sm btn-sm-outline" onclick="openAddVideoModal('${course.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Another Video
          </button>
        </div>
      </div>
    </div>`;
}

function buildVideoList(course) {
  if (!course.videos.length) {
    return '<div style="padding:20px;text-align:center;font-size:0.83rem;color:var(--text-muted);">No videos yet. Add a YouTube video to get started.</div>';
  }
  return [...course.videos].sort((a, b) => a.order - b.order).map(v => `
    <div class="video-manage-item">
      <div class="video-manage-num">${v.order}</div>
      <div class="video-manage-info">
        <div class="video-manage-title">${v.title}</div>
        <div class="video-manage-url">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          youtube.com/watch?v=${v.youtubeId} · ${v.duration || '—'}
        </div>
      </div>
      <div class="video-manage-actions">
        <button class="btn-sm btn-sm-danger" onclick="deleteVideo('${course.id}','${v.id}')" title="Remove video">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
    </div>`).join('');
}

function attachCourseCardEvents() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
}

window.toggleCourseAccordion = function (courseId) {
  const body   = document.getElementById(`accordion-${courseId}`);
  const card   = document.querySelector(`.course-manage-card[data-course-id="${courseId}"] .course-manage-head`);
  if (!body) return;
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  const chevron = card?.querySelector('.chevron-icon');
  if (chevron) chevron.style.transform = open ? '' : 'rotate(180deg)';
};

/* ────────────────────── Course CRUD ────────────────────── */
function initCourseForm() {
  const btn = document.getElementById('btnCreateCourse');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const title = document.getElementById('newCourseTitle').value.trim();
    const desc  = document.getElementById('newCourseDesc').value.trim();
    const cat   = document.getElementById('newCourseCat').value;
    const icon  = document.getElementById('newCourseIcon').value;

    if (!title)  { showToast('Please enter a course title.', 'error'); return; }
    if (!desc)   { showToast('Please add a description.', 'error'); return; }
    if (!cat)    { showToast('Please select a category.', 'error'); return; }

    const colors = [
      'linear-gradient(135deg,#3B82F6,#8B5CF6)',
      'linear-gradient(135deg,#10B981,#06B6D4)',
      'linear-gradient(135deg,#F59E0B,#EF4444)',
      'linear-gradient(135deg,#8B5CF6,#EC4899)',
    ];
    const newCourse = {
      id: 'c' + Date.now(),
      title, description: desc, category: cat, icon,
      trainerId: SESSION.userId,
      trainerName: SESSION.name,
      color: colors[Math.floor(Math.random() * colors.length)],
      enrolledCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      videos: [],
    };

    const courses = getCourses();
    courses.push(newCourse);
    saveCourses(courses);

    closeModal('addCourseModal');
    document.getElementById('newCourseTitle').value = '';
    document.getElementById('newCourseDesc').value  = '';
    document.getElementById('newCourseCat').value   = '';

    showToast(`Course "${title}" created! 🎉`, 'success');
    renderTrainerStats();
    renderTrainerCourses('tCoursesList', 99);
    renderTrainerCourses('tOverviewCourses', 2);
  });
}

window.deleteCourse = function (courseId) {
  const c = getCourses().find(c => c.id === courseId);
  if (!confirm(`Delete "${c?.title}"? This cannot be undone.`)) return;
  const courses = getCourses().filter(c => c.id !== courseId);
  saveCourses(courses);
  showToast('Course deleted.', 'warning');
  renderTrainerStats();
  renderTrainerCourses('tCoursesList', 99);
  renderTrainerCourses('tOverviewCourses', 2);
};

/* ────────────────────── Video CRUD ────────────────────── */
function initVideoForm() {
  const btn = document.getElementById('btnAddVideo');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const courseId = document.getElementById('videoTargetCourse').value;
    const title    = document.getElementById('newVideoTitle').value.trim();
    const url      = document.getElementById('newVideoUrl').value.trim();
    const dur      = document.getElementById('newVideoDuration').value.trim();
    const ytId     = extractYouTubeId(url);

    if (!title) { showToast('Please enter a video title.', 'error'); return; }
    if (!ytId)  { showToast('Please enter a valid YouTube URL.', 'error'); return; }

    const courses  = getCourses();
    const course   = courses.find(c => c.id === courseId);
    if (!course) { showToast('Course not found.', 'error'); return; }

    const newVideo = {
      id:       'v' + Date.now(),
      title, youtubeId: ytId,
      duration: dur || '—',
      order:    course.videos.length + 1,
    };
    course.videos.push(newVideo);
    saveCourses(courses);

    closeModal('addVideoModal');
    document.getElementById('newVideoTitle').value    = '';
    document.getElementById('newVideoUrl').value      = '';
    document.getElementById('newVideoDuration').value = '';
    document.getElementById('ytPreview').classList.remove('show');

    showToast(`Video "${title}" added! 🎬`, 'success');
    renderTrainerStats();
    renderTrainerCourses('tCoursesList', 99);
    renderTrainerCourses('tOverviewCourses', 2);
  });
}

window.openAddVideoModal = function (courseId) {
  document.getElementById('videoTargetCourse').value = courseId;
  document.getElementById('newVideoTitle').value     = '';
  document.getElementById('newVideoUrl').value       = '';
  document.getElementById('newVideoDuration').value  = '';
  document.getElementById('ytPreview').classList.remove('show');
  openModal('addVideoModal');
};

window.deleteVideo = function (courseId, videoId) {
  const courses = getCourses();
  const course  = courses.find(c => c.id === courseId);
  if (!course) return;
  course.videos = course.videos.filter(v => v.id !== videoId);
  // Re-number
  course.videos.forEach((v, i) => v.order = i + 1);
  saveCourses(courses);
  showToast('Video removed.', 'warning');
  renderTrainerStats();
  renderTrainerCourses('tCoursesList', 99);
  renderTrainerCourses('tOverviewCourses', 2);
};

/* YouTube URL → ID */
function extractYouTubeId(url) {
  const patterns = [
    /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/* YouTube preview */
window.previewYouTube = function (url) {
  const preview  = document.getElementById('ytPreview');
  const thumb    = document.getElementById('ytPreviewThumb');
  const titleEl  = document.getElementById('ytPreviewTitle');
  const idEl     = document.getElementById('ytPreviewId');
  const ytId     = extractYouTubeId(url);
  if (ytId) {
    thumb.src        = `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
    titleEl.textContent = 'Valid YouTube URL ✓';
    idEl.textContent    = `Video ID: ${ytId}`;
    preview.classList.add('show');
  } else {
    preview.classList.remove('show');
  }
};

/* ────────────────────── Student Table ────────────────────── */
function renderStudentTable(filter = '') {
  const tbody   = document.getElementById('tStudentTableBody');
  if (!tbody) return;

  const myCourses = getMyCoursesData();
  const myCourseIds = new Set(myCourses.map(c => c.id));
  const students  = getUsers().filter(u => {
    if (u.role !== 'student') return false;
    if (!(u.enrolledCourses || []).some(id => myCourseIds.has(id))) return false;
    if (filter) return u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
    return true;
  });

  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No students found.</td></tr>';
    return;
  }

  const rows = [];
  students.forEach(s => {
    (s.enrolledCourses || []).filter(id => myCourseIds.has(id)).forEach(cId => {
      const course = myCourses.find(c => c.id === cId);
      if (!course) return;
      const pct = getCourseProgress(s.id, cId);
      rows.push(`
        <tr>
          <td><div class="user-cell">
            <div class="avatar-sm" style="background:${avatarColor(s.name)}">${s.name.charAt(0)}</div>
            <div class="user-cell-info"><div class="user-cell-name">${s.name}</div><div class="user-cell-email">${s.email}</div></div>
          </div></td>
          <td style="font-size:0.83rem;">${course.title}</td>
          <td style="font-size:0.83rem;">${formatDate(s.createdAt)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="mini-progress"><div class="mini-progress-fill" style="width:${pct}%"></div></div>
              <span style="font-size:0.78rem;font-weight:700;color:var(--primary);">${pct}%</span>
            </div>
          </td>
          <td><span class="badge ${s.status==='active'?'badge-success':'badge-danger'}">${s.status}</span></td>
        </tr>`);
    });
  });

  tbody.innerHTML = rows.join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No students found.</td></tr>';
}

window.filterStudents = function (q) { renderStudentTable(q); };

/* ────────────────────── Analytics ────────────────────── */
function renderAnalytics() {
  const container = document.getElementById('analyticsContent');
  if (!container) return;

  const myCourses = getMyCoursesData();
  if (!myCourses.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>Create courses to see analytics.</p></div>';
    return;
  }

  const students = getUsers().filter(u => u.role === 'student');

  container.innerHTML = `
    <div class="table-wrapper">
      <div class="table-header"><span class="table-title">Course Performance</span></div>
      <table class="data-table">
        <thead><tr><th>Course</th><th>Students</th><th>Videos</th><th>Avg. Completion</th><th>Completions</th></tr></thead>
        <tbody>
          ${myCourses.map(course => {
            const enrolled = students.filter(s => (s.enrolledCourses||[]).includes(course.id));
            let totalPct = 0, completions = 0;
            enrolled.forEach(s => {
              const pct = getCourseProgress(s.id, course.id);
              totalPct += pct;
              if (pct === 100) completions++;
            });
            const avg = enrolled.length ? Math.round(totalPct / enrolled.length) : 0;
            return `<tr>
              <td><div style="display:flex;align-items:center;gap:10px;">
                <div style="width:32px;height:32px;border-radius:6px;background:${course.color};display:flex;align-items:center;justify-content:center;font-size:1rem;">${course.icon||'📖'}</div>
                <span style="font-weight:600;font-size:0.87rem;">${course.title}</span>
              </div></td>
              <td>${enrolled.length}</td>
              <td>${course.videos.length}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="mini-progress" style="min-width:80px;"><div class="mini-progress-fill" style="width:${avg}%"></div></div>
                  <span style="font-size:0.78rem;font-weight:700;color:var(--primary);">${avg}%</span>
                </div>
              </td>
              <td><span class="badge badge-success">${completions}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ────────────────────── Settings ────────────────────── */
function loadTrainerSettings() {
  const users = getUsers();
  const me    = users.find(u => u.id === SESSION.userId);
  if (!me) return;
  const nameEl    = document.getElementById('tSettingName');
  const emailEl   = document.getElementById('tSettingEmail');
  const subjectEl = document.getElementById('tSettingSubject');
  if (nameEl)    nameEl.value    = me.name    || '';
  if (emailEl)   emailEl.value   = me.email   || '';
  if (subjectEl) subjectEl.value = me.subject || '';
}
