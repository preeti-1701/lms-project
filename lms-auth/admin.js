/* ════════════════════════════════════════════════════════
   EduVerse LMS – admin.js
   Admin dashboard logic
   ════════════════════════════════════════════════════════ */

let SESSION = null;

(function init() {
  SESSION = sessionGuard(['admin']);
  if (!SESSION) return;

  renderUserInfo(SESSION);
  initSidebarNav();
  initModals();
  renderAdminStats();
  renderOverviewSessions();
  renderOverviewAudit();
  renderUsersTable();
  renderAdminCourses();
  renderSessionsTable();
  renderAuditLog();
  initUserForm();
  initAssignModal();

  // Update active session badge
  updateSessionBadge();
})();

/* ────────────────────── Stats ────────────────────── */
function renderAdminStats() {
  const users    = getUsers();
  const courses  = getCourses();
  const sessions = getSessions();
  const enrollments = users.filter(u => u.role === 'student').reduce((a, u) => a + (u.enrolledCourses||[]).length, 0);

  document.getElementById('aStatUsers').textContent       = users.length;
  document.getElementById('aStatSessions').textContent    = sessions.length;
  document.getElementById('aStatCourses').textContent     = courses.length;
  document.getElementById('aStatEnrollments').textContent = enrollments;
  updateSessionBadge();
}

function updateSessionBadge() {
  const badge = document.getElementById('activeSessionBadge');
  const count = document.getElementById('sessionCount');
  const n     = getSessions().length;
  if (badge) badge.textContent = n;
  if (count) count.textContent = n;
}

/* ────────────────────── Overview Sessions ────────────────────── */
function renderOverviewSessions() {
  const tbody = document.getElementById('aOverviewSessions');
  if (!tbody) return;
  const sessions = getSessions().slice(0, 5);
  if (!sessions.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px;">No active sessions.</td></tr>';
    return;
  }
  tbody.innerHTML = sessions.map(s => buildSessionRow(s, true)).join('');
}

function buildSessionRow(s, compact) {
  const roleClass = { student:'badge-primary', trainer:'badge-purple', admin:'badge-danger' }[s.role] || 'badge-muted';
  return `
    <tr id="session-row-${s.id}">
      <td><div class="user-cell">
        <div class="avatar-sm" style="background:${avatarColor(s.userName)}">${s.userName.charAt(0)}</div>
        <div class="user-cell-info"><div class="user-cell-name">${s.userName}</div></div>
      </div></td>
      <td><span class="badge ${roleClass}">${s.role}</span></td>
      <td style="font-size:0.83rem;font-family:monospace;">${s.ip}</td>
      <td style="font-size:0.78rem;color:var(--text-secondary);">${s.device}</td>
      <td style="font-size:0.78rem;">${formatDateTime(s.loginTime)}</td>
      ${!compact ? `<td style="font-size:0.78rem;">${getSessionDuration(s.loginTime)}</td>` : ''}
      <td><button class="btn-sm btn-sm-danger" onclick="forceLogout('${s.id}','${s.userName}')">Force Logout</button></td>
    </tr>`;
}

function getSessionDuration(loginTime) {
  const m = Math.floor((Date.now() - new Date(loginTime).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m/60)}h ${m%60}m`;
}

/* ────────────────────── Overview Audit ────────────────────── */
function renderOverviewAudit() {
  const tbody = document.getElementById('aOverviewAudit');
  if (!tbody) return;
  const log = getAudit().slice(0, 6);
  tbody.innerHTML = log.map(e => buildAuditRow(e)).join('');
}

function buildAuditRow(e) {
  return `
    <tr>
      <td><div class="user-cell">
        <div class="avatar-sm" style="background:${avatarColor(e.userName)}">${(e.userName||'?').charAt(0)}</div>
        <div class="user-cell-info"><div class="user-cell-name">${e.userName}</div></div>
      </div></td>
      <td><span class="audit-action audit-${e.action}">${e.action}</span></td>
      <td style="font-size:0.78rem;color:var(--text-secondary);">${timeAgo(e.timestamp)}</td>
      <td style="font-size:0.78rem;font-family:monospace;">${e.ip}</td>
      <td style="font-size:0.78rem;color:var(--text-secondary);">${e.details}</td>
    </tr>`;
}

/* ────────────────────── Users Table ────────────────────── */
function renderUsersTable(filterText = '', filterRole = '') {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  let users = getUsers();
  if (filterRole) users = users.filter(u => u.role === filterRole);
  if (filterText) {
    const q = filterText.toLowerCase();
    users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  const countEl = document.getElementById('userCount');
  if (countEl) countEl.textContent = users.length;

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => {
    const roleClass   = { student:'badge-primary', trainer:'badge-purple', admin:'badge-danger' }[u.role] || 'badge-muted';
    const statusClass = u.status === 'active' ? 'badge-success' : 'badge-muted';
    const enrolled    = (u.enrolledCourses || []).length;
    return `
      <tr>
        <td><div class="user-cell">
          <div class="avatar-sm" style="background:${avatarColor(u.name)}">${u.name.charAt(0)}</div>
          <div class="user-cell-info"><div class="user-cell-name">${u.name}</div><div class="user-cell-email">${u.email}</div></div>
        </div></td>
        <td>
          <select class="role-select" onchange="changeUserRole('${u.id}',this.value)">
            <option value="student"  ${u.role==='student' ?'selected':''}>Student</option>
            <option value="trainer"  ${u.role==='trainer' ?'selected':''}>Trainer</option>
            <option value="admin"    ${u.role==='admin'   ?'selected':''}>Admin</option>
          </select>
        </td>
        <td>
          <button class="badge ${statusClass} status-toggle" onclick="toggleUserStatus('${u.id}')" title="Click to toggle">
            <span class="badge-dot"></span>
            ${u.status}
          </button>
        </td>
        <td style="font-size:0.78rem;">${formatDate(u.createdAt)}</td>
        <td style="font-size:0.78rem;">${timeAgo(u.lastLogin)}</td>
        <td>
          <div style="display:flex;gap:6px;">
            ${u.role === 'student' ? `<button class="btn-sm btn-sm-outline" onclick="openAssignCourses('${u.id}','${u.name}')">Assign Courses</button>` : ''}
            <button class="btn-sm btn-sm-danger" onclick="deleteUser('${u.id}','${u.name}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

window.filterUsers = function (q) {
  const roleFilter = document.getElementById('roleFilter')?.value || '';
  renderUsersTable(q, roleFilter);
};

window.toggleUserStatus = function (userId) {
  const users = getUsers();
  const user  = users.find(u => u.id === userId);
  if (!user) return;
  const was = user.status;
  user.status = was === 'active' ? 'disabled' : 'active';
  saveUsers(users);
  addAuditEntry(userId, user.name, user.status === 'disabled' ? 'DISABLED' : 'CREATED', `Status changed to ${user.status} by admin`, SESSION.ip || '—');
  showToast(`User "${user.name}" ${user.status === 'active' ? 'activated' : 'disabled'}.`, user.status === 'active' ? 'success' : 'warning');
  renderUsersTable(document.getElementById('userSearch')?.value || '', document.getElementById('roleFilter')?.value || '');
  renderAdminStats();
};

window.changeUserRole = function (userId, newRole) {
  const users = getUsers();
  const user  = users.find(u => u.id === userId);
  if (!user) return;
  user.role = newRole;
  saveUsers(users);
  showToast(`${user.name}'s role updated to ${newRole}.`, 'success');
  renderUsersTable();
};

window.deleteUser = function (userId, name) {
  if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  addAuditEntry(userId, name, 'DISABLED', 'Account deleted by admin', '—');
  showToast(`User "${name}" deleted.`, 'warning');
  renderUsersTable();
  renderAdminStats();
};

/* ────────────────────── Add User Form ────────────────────── */
function initUserForm() {
  const btn = document.getElementById('btnCreateUser');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name  = document.getElementById('newUserName').value.trim();
    const role  = document.getElementById('newUserRole').value;
    const email = document.getElementById('newUserEmail').value.trim();
    const pw    = document.getElementById('newUserPw').value;

    if (!name)             { showToast('Name is required.', 'error'); return; }
    if (!email.includes('@')) { showToast('Enter a valid email.', 'error'); return; }
    if (pw.length < 8)    { showToast('Password must be at least 8 characters.', 'error'); return; }

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      showToast('A user with this email already exists.', 'error'); return;
    }

    const newUser = {
      id: 'u' + Date.now(), name, email, role, status: 'active',
      enrolledCourses: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '—', ip: '—', device: '—',
    };
    users.push(newUser);
    saveUsers(users);

    addAuditEntry(newUser.id, name, 'CREATED', `User created by admin (role: ${role})`, '—');
    closeModal('addUserModal');
    ['newUserName','newUserEmail','newUserPw'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    showToast(`User "${name}" created successfully! ✅`, 'success');
    renderUsersTable();
    renderAdminStats();
  });
}

/* ────────────────────── Assign Courses ────────────────────── */
function initAssignModal() {
  const btn = document.getElementById('btnAssignCourses');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const userId  = document.getElementById('assignUserId').value;
    const users   = getUsers();
    const user    = users.find(u => u.id === userId);
    if (!user) return;

    const checked = [...document.querySelectorAll('#courseCheckboxList input:checked')].map(cb => cb.value);
    user.enrolledCourses = checked;
    saveUsers(users);
    closeModal('assignCourseModal');
    showToast(`Courses assigned to ${user.name}. ✅`, 'success');
    renderUsersTable();
  });
}

window.openAssignCourses = function (userId, userName) {
  document.getElementById('assignUserId').value    = userId;
  document.getElementById('assignUserLabel').textContent = `Assigning courses to: ${userName}`;

  const users  = getUsers();
  const user   = users.find(u => u.id === userId) || {};
  const enrolled = new Set(user.enrolledCourses || []);
  const courses  = getCourses();

  document.getElementById('courseCheckboxList').innerHTML = courses.map(c => `
    <label style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;cursor:pointer;transition:background var(--transition);" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background=''">
      <input type="checkbox" value="${c.id}" ${enrolled.has(c.id) ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--primary)"/>
      <div style="width:32px;height:32px;border-radius:6px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${c.icon||'📖'}</div>
      <div>
        <div style="font-weight:600;font-size:0.87rem;">${c.title}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);">${c.category} · ${c.videos.length} videos</div>
      </div>
    </label>`).join('');

  openModal('assignCourseModal');
};

/* ────────────────────── Admin Courses Table ────────────────────── */
function renderAdminCourses(filter = '') {
  const tbody = document.getElementById('adminCoursesBody');
  if (!tbody) return;

  let courses = getCourses();
  if (filter) {
    const q = filter.toLowerCase();
    courses  = courses.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }

  const users = getUsers();
  tbody.innerHTML = courses.map(c => {
    const studCount = users.filter(u => u.role==='student' && (u.enrolledCourses||[]).includes(c.id)).length;
    return `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:8px;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">${c.icon||'📖'}</div>
          <div><div style="font-weight:600;font-size:0.87rem;">${c.title}</div><div style="font-size:0.72rem;color:var(--text-muted);">${c.description.slice(0,50)}…</div></div>
        </div></td>
        <td style="font-size:0.83rem;">${c.trainerName}</td>
        <td><span class="badge badge-info">${c.category}</span></td>
        <td style="font-size:0.83rem;">${c.videos.length}</td>
        <td style="font-size:0.83rem;">${studCount}</td>
        <td style="font-size:0.78rem;">${formatDate(c.createdAt)}</td>
      </tr>`;
  }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px;">No courses found.</td></tr>';
}

window.filterCourses = function (q) { renderAdminCourses(q); };

/* ────────────────────── Sessions Table ────────────────────── */
function renderSessionsTable() {
  const tbody = document.getElementById('sessionsTableBody');
  if (!tbody) return;

  const sessions = getSessions();
  updateSessionBadge();

  if (!sessions.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">No active sessions.</td></tr>';
    return;
  }

  tbody.innerHTML = sessions.map(s => buildSessionRow(s, false)).join('');
}

window.forceLogout = function (sessionId, userName) {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  saveSessions(sessions);
  addAuditEntry(sessionId, userName, 'FORCED', 'Session force-terminated by admin', SESSION.ip || '—');
  showToast(`Session for ${userName} has been terminated.`, 'warning');
  renderSessionsTable();
  renderOverviewSessions();
  renderAdminStats();
  document.getElementById('aStatSessions').textContent = sessions.length;
};

window.forceLogoutAll = function () {
  if (!confirm('Force logout ALL active sessions? This will disconnect all currently logged-in users.')) return;
  const sessions = getSessions();
  sessions.forEach(s => addAuditEntry(s.userId, s.userName, 'FORCED', 'Session force-terminated by admin (all)', SESSION.ip||'—'));
  saveSessions([]);
  showToast('All sessions terminated.', 'warning');
  renderSessionsTable();
  renderOverviewSessions();
  renderAdminStats();
};

/* ────────────────────── Audit Log ────────────────────── */
window.renderAuditLog = function () {
  const tbody     = document.getElementById('auditTableBody');
  if (!tbody) return;
  const filterVal = document.getElementById('auditFilter')?.value || '';

  let log = getAudit();
  if (filterVal) log = log.filter(e => e.action === filterVal);

  tbody.innerHTML = log.map(e => buildAuditRow(e)).join('') ||
    '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No events match the filter.</td></tr>';
};
