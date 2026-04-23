/* ── LMS App JS ── */

// ── API Client ──
const API = {
  base: '/api',
  getHeaders() {
    const token = localStorage.getItem('lms_access_token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  },
  async request(method, path, body) {
    const opts = { method, headers: this.getHeaders() };
    if (body) opts.body = JSON.stringify(body);
    let res = await fetch(this.base + path, opts);
    if (res.status === 401) {
      const refreshed = await this.refreshToken();
      if (!refreshed) { logout(); return null; }
      opts.headers = this.getHeaders();
      res = await fetch(this.base + path, opts);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || JSON.stringify(err));
    }
    return res.status === 204 ? null : res.json();
  },
  async refreshToken() {
    const refresh = localStorage.getItem('lms_refresh_token');
    if (!refresh) return false;
    try {
      const res = await fetch(this.base + '/auth/token/refresh/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('lms_access_token', data.access);
      return true;
    } catch { return false; }
  },
  get: (path) => API.request('GET', path),
  post: (path, body) => API.request('POST', path, body),
  patch: (path, body) => API.request('PATCH', path, body),
  del: (path) => API.request('DELETE', path),
};

// ── Auth helpers ──
function getUser() {
  try { return JSON.parse(localStorage.getItem('lms_user') || 'null'); } catch { return null; }
}
function logout() {
  API.post('/auth/logout/', {}).catch(() => {});
  localStorage.clear();
  window.location.href = '/login/';
}
function requireAuth() {
  if (!localStorage.getItem('lms_access_token')) { window.location.href = '/login/'; return null; }
  return getUser();
}

// ── Toast notifications ──
function showToast(msg, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span style="font-weight:600;color:var(--${type === 'success' ? 'green' : type === 'error' ? 'destructive' : 'primary'})">${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// ── Modal helpers ──
function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay')?.classList.add('hidden'));
  });
}

// ── Dropdown toggle ──
function initDropdowns() {
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-dropdown-toggle]');
    if (trigger) {
      e.stopPropagation();
      const menu = document.getElementById(trigger.dataset.dropdownToggle);
      document.querySelectorAll('.dropdown-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
      menu?.classList.toggle('open');
    } else {
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
}

// ── Sidebar active ──
function initNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href') || item.dataset.href;
    if (href && path.startsWith(href) && href !== '/') item.classList.add('active');
    if (href === '/' && path === '/') item.classList.add('active');
  });
  // User info
  const user = getUser();
  if (user) {
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.full_name || user.email);
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role);
    document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = (user.full_name || user.email || 'U')[0].toUpperCase());
    document.querySelectorAll('[data-role-show]').forEach(el => {
      const roles = el.dataset.roleShow.split(',');
      if (!roles.includes(user.role)) el.remove();
    });
  }
}

// ── Status badge helper ──
function statusBadge(status) {
  const map = {
    'PUBLISHED': ['badge-green', 'Published'],
    'DRAFT': ['badge-yellow', 'Draft'],
    'ARCHIVED': ['badge-neutral', 'Archived'],
    'ADMIN': ['badge-indigo', 'Admin'],
    'TRAINER': ['badge-violet', 'Trainer'],
    'STUDENT': ['badge-blue', 'Student'],
    'active': ['badge-green', 'Active'],
    'inactive': ['badge-neutral', 'Inactive'],
  };
  const [cls, label] = map[status] || ['badge-neutral', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── Progress color ──
function progressColor(pct) {
  if (pct >= 85) return 'progress-red';
  if (pct >= 60) return 'progress-yellow';
  return 'progress-green';
}

// ── Relative time ──
function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Format date ──
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Pagination ──
function buildPagination(container, { page, count, pageSize }, onPage) {
  const total = Math.ceil(count / pageSize);
  if (total <= 1) { container.innerHTML = ''; return; }
  let html = `<div class="flex items-center gap-2 mt-4" style="font-size:0.8rem;">`;
  html += `<button class="btn btn-secondary btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="(${onPage.toString()})(${page - 1})">← Prev</button>`;
  html += `<span class="text-muted">Page ${page} of ${total}</span>`;
  html += `<button class="btn btn-secondary btn-sm" ${page >= total ? 'disabled' : ''} onclick="(${onPage.toString()})(${page + 1})">Next →</button>`;
  html += `</div>`;
  container.innerHTML = html;
}

// ── Skeleton loader ──
function skeleton(lines = 5, cols = 4) {
  let html = '';
  for (let i = 0; i < lines; i++) {
    html += '<tr>';
    for (let j = 0; j < cols; j++) {
      html += `<td><div style="height:14px;background:var(--secondary);border-radius:4px;width:${60 + Math.random()*30}%;animation:skeleton-pulse 1.5s infinite ${i*0.1}s;"></div></td>`;
    }
    html += '</tr>';
  }
  return html;
}
const skeletonCSS = document.createElement('style');
skeletonCSS.textContent = `@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:0.4}}`;
document.head.appendChild(skeletonCSS);

// ── Init on load ──
document.addEventListener('DOMContentLoaded', () => {
  initModals();
  initDropdowns();
  initNav();
});
