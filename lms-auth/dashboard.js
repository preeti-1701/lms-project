/* ════════════════════════════════════════════════════════════
   EduVerse LMS – dashboard.js
   Shared: mock data, session guard, security, watermark, utils
   ════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════
   MOCK DATA DEFINITIONS
═══════════════════════════════════ */
const DEFAULT_DATA = {
  users: [
    { id:'u1', name:'System Admin',      email:'admin@eduverse.com',     role:'admin',   status:'active',   createdAt:'2024-01-10', lastLogin: new Date().toISOString(),         ip:'192.168.1.100', device:'Chrome / macOS' },
    { id:'u2', name:'Dr. Sarah Chen',    email:'sarah@eduverse.com',     role:'trainer', status:'active',   createdAt:'2024-01-20', lastLogin:'2024-04-13T14:30:00.000Z',        ip:'10.0.0.24',    device:'Firefox / Windows' },
    { id:'u3', name:'Prof. Raj Kumar',   email:'raj@eduverse.com',       role:'trainer', status:'active',   createdAt:'2024-02-05', lastLogin:'2024-04-12T09:15:00.000Z',        ip:'10.0.0.31',    device:'Chrome / Windows' },
    { id:'u4', name:'Alice Johnson',     email:'alice@student.com',      role:'student', status:'active',   createdAt:'2024-02-20', lastLogin: new Date().toISOString(),         ip:'192.168.1.45', device:'Chrome / macOS',   enrolledCourses:['c1','c2','c3'] },
    { id:'u5', name:'Bob Williams',      email:'bob@student.com',        role:'student', status:'active',   createdAt:'2024-03-01', lastLogin:'2024-04-13T16:45:00.000Z',        ip:'192.168.1.67', device:'Safari / iPhone',  enrolledCourses:['c1','c4'] },
    { id:'u6', name:'Carol Davis',       email:'carol@student.com',      role:'student', status:'active',   createdAt:'2024-03-10', lastLogin:'2024-04-14T08:00:00.000Z',        ip:'10.0.0.88',    device:'Chrome / Windows', enrolledCourses:['c2','c3','c5'] },
    { id:'u7', name:'David Lee',         email:'david@student.com',      role:'student', status:'disabled', createdAt:'2024-03-15', lastLogin:'2024-04-10T11:20:00.000Z',        ip:'10.0.0.95',    device:'Edge / Windows',   enrolledCourses:['c1'] },
    { id:'u8', name:'Emma Wilson',       email:'emma@student.com',       role:'student', status:'active',   createdAt:'2024-03-20', lastLogin:'2024-04-14T07:30:00.000Z',        ip:'192.168.1.102',device:'Chrome / Android', enrolledCourses:['c4','c5','c6'] },
    { id:'u9', name:'Frank Thomas',      email:'frank@student.com',      role:'student', status:'active',   createdAt:'2024-04-01', lastLogin:'2024-04-13T12:00:00.000Z',        ip:'10.0.0.55',    device:'Chrome / Windows', enrolledCourses:['c1','c6'] },
    { id:'u10',name:'Grace Kim',         email:'grace@student.com',      role:'student', status:'active',   createdAt:'2024-04-05', lastLogin:'2024-04-14T06:45:00.000Z',        ip:'192.168.2.10', device:'Safari / iPad',    enrolledCourses:['c2','c4'] },
  ],
  courses: [
    { id:'c1', title:'Complete Web Development Bootcamp',
      description:'Master HTML, CSS, JavaScript, and React from beginner to advanced. Build real-world projects throughout the course.',
      category:'Web Development', trainerId:'u2', trainerName:'Dr. Sarah Chen',
      color:'linear-gradient(135deg,#3B82F6,#8B5CF6)', icon:'💻', enrolledCount:45, createdAt:'2024-02-15',
      videos:[
        { id:'v101', title:'Course Overview & Setup',      youtubeId:'G3e-cpL7ofc', duration:'8:24',  order:1 },
        { id:'v102', title:'HTML Structure Fundamentals',  youtubeId:'pQN-pnXPaVg', duration:'15:30', order:2 },
        { id:'v103', title:'CSS Styling & Layouts',        youtubeId:'OXGznpKZ_sA', duration:'22:10', order:3 },
        { id:'v104', title:'JavaScript ES6+ Basics',       youtubeId:'PkZNo7MFNFg', duration:'19:45', order:4 },
        { id:'v105', title:'Introduction to React',        youtubeId:'bMknfKXIFA8', duration:'25:00', order:5 },
      ]
    },
    { id:'c2', title:'Python for Data Science',
      description:'Learn Python programming and data analysis with Pandas, NumPy, and Matplotlib. Includes hands-on projects.',
      category:'Data Science', trainerId:'u3', trainerName:'Prof. Raj Kumar',
      color:'linear-gradient(135deg,#10B981,#06B6D4)', icon:'📊', enrolledCount:38, createdAt:'2024-02-28',
      videos:[
        { id:'v201', title:'Python Installation & Basics', youtubeId:'rfscVS0vtbw', duration:'12:20', order:1 },
        { id:'v202', title:'Data Types & Control Flow',    youtubeId:'kqtD5dpn9C8', duration:'14:35', order:2 },
        { id:'v203', title:'NumPy Fundamentals',           youtubeId:'QUT1VHiLmmI', duration:'18:00', order:3 },
        { id:'v204', title:'Pandas for Data Analysis',     youtubeId:'vmEHCJofslg', duration:'20:15', order:4 },
      ]
    },
    { id:'c3', title:'UI/UX Design Fundamentals',
      description:'Learn design principles, Figma, user research, and prototyping for modern digital products.',
      category:'Design', trainerId:'u2', trainerName:'Dr. Sarah Chen',
      color:'linear-gradient(135deg,#F59E0B,#EF4444)', icon:'🎨', enrolledCount:29, createdAt:'2024-03-05',
      videos:[
        { id:'v301', title:'Design Thinking Intro',        youtubeId:'JGLfyTDgfDc', duration:'11:15', order:1 },
        { id:'v302', title:'Color Theory & Typography',    youtubeId:'YqQx75OPRa0', duration:'16:40', order:2 },
        { id:'v303', title:'Figma for Beginners',          youtubeId:'FTFaQWZBqQ8', duration:'24:30', order:3 },
      ]
    },
    { id:'c4', title:'Machine Learning with Python',
      description:'Build ML models with scikit-learn and TensorFlow. Covers supervised, unsupervised learning and neural networks.',
      category:'AI / ML', trainerId:'u3', trainerName:'Prof. Raj Kumar',
      color:'linear-gradient(135deg,#8B5CF6,#EC4899)', icon:'🤖', enrolledCount:52, createdAt:'2024-03-12',
      videos:[
        { id:'v401', title:'ML Introduction & Math',       youtubeId:'NWONeJKn6kc', duration:'13:00', order:1 },
        { id:'v402', title:'Supervised Learning',          youtubeId:'XT18aCL2gBU', duration:'17:20', order:2 },
        { id:'v403', title:'Neural Networks Basics',       youtubeId:'aircAruvnKk', duration:'21:00', order:3 },
        { id:'v404', title:'Model Evaluation & Tuning',   youtubeId:'CCQoTTTFqhs', duration:'15:45', order:4 },
        { id:'v405', title:'Project: Image Classifier',    youtubeId:'RrYCboAMId8', duration:'28:30', order:5 },
      ]
    },
    { id:'c5', title:'SQL & Database Design',
      description:'Master relational databases, SQL queries, joins, indexing and database optimization techniques.',
      category:'Data Engineering', trainerId:'u3', trainerName:'Prof. Raj Kumar',
      color:'linear-gradient(135deg,#06B6D4,#3B82F6)', icon:'🗄️', enrolledCount:33, createdAt:'2024-03-20',
      videos:[
        { id:'v501', title:'Database Fundamentals',        youtubeId:'HXV3zeQKqGY', duration:'10:00', order:1 },
        { id:'v502', title:'SQL SELECT & Filtering',       youtubeId:'p3qvj9hO_Bo', duration:'14:20', order:2 },
        { id:'v503', title:'Joins & Relationships',        youtubeId:'9yeOJ0ZMUYw', duration:'18:30', order:3 },
      ]
    },
    { id:'c6', title:'Node.js Backend Development',
      description:'Build scalable REST APIs with Node.js, Express and MongoDB. Deploy to cloud infrastructure.',
      category:'Web Development', trainerId:'u2', trainerName:'Dr. Sarah Chen',
      color:'linear-gradient(135deg,#10B981,#3B82F6)', icon:'⚙️', enrolledCount:27, createdAt:'2024-03-28',
      videos:[
        { id:'v601', title:'Node.js Fundamentals',         youtubeId:'Oe421EPjeBE', duration:'16:00', order:1 },
        { id:'v602', title:'Express.js Framework',         youtubeId:'L72fhGm1tfE', duration:'20:30', order:2 },
        { id:'v603', title:'REST API Design',              youtubeId:'fgTGADljAeg', duration:'22:15', order:3 },
        { id:'v604', title:'MongoDB Integration',          youtubeId:'ExcRbA7ffy4', duration:'25:00', order:4 },
      ]
    },
  ],
  progress: {
    'u4': { 'c1':{'v101':100,'v102':100,'v103':75,'v104':0,'v105':0}, 'c2':{'v201':100,'v202':60,'v203':0,'v204':0}, 'c3':{'v301':100,'v302':100,'v303':100} },
    'u5': { 'c1':{'v101':100,'v102':50,'v103':0,'v104':0,'v105':0}, 'c4':{'v401':100,'v402':80,'v403':30,'v404':0,'v405':0} },
    'u6': { 'c2':{'v201':100,'v202':100,'v203':100,'v204':80}, 'c3':{'v301':100,'v302':40,'v303':0}, 'c5':{'v501':100,'v502':60,'v503':0} },
    'u7': { 'c1':{'v101':100,'v102':100,'v103':100,'v104':100,'v105':100} },
    'u8': { 'c4':{'v401':100,'v402':100,'v403':50,'v404':0,'v405':0}, 'c5':{'v501':100,'v502':100,'v503':100}, 'c6':{'v601':100,'v602':30,'v603':0,'v604':0} },
    'u9': { 'c1':{'v101':100,'v102':100,'v103':100,'v104':50,'v105':0}, 'c6':{'v601':100,'v602':100,'v603':60,'v604':0} },
    'u10':{ 'c2':{'v201':100,'v202':100,'v203':100,'v204':100}, 'c4':{'v401':100,'v402':100,'v403':100,'v404':100,'v405':80} },
  },
  notes: {},
  sessions: [
    { id:'s1', userId:'u4', userName:'Alice Johnson',   role:'student', loginTime: new Date(Date.now()-30*60000).toISOString(),  ip:'192.168.1.45',  device:'Chrome 124 / macOS', status:'active' },
    { id:'s2', userId:'u6', userName:'Carol Davis',     role:'student', loginTime: new Date(Date.now()-90*60000).toISOString(),  ip:'10.0.0.88',     device:'Chrome 124 / Windows 11', status:'active' },
    { id:'s3', userId:'u8', userName:'Emma Wilson',     role:'student', loginTime: new Date(Date.now()-45*60000).toISOString(),  ip:'192.168.1.102', device:'Chrome 124 / Android', status:'active' },
    { id:'s4', userId:'u2', userName:'Dr. Sarah Chen',  role:'trainer', loginTime: new Date(Date.now()-120*60000).toISOString(), ip:'10.0.0.24',     device:'Firefox 125 / Windows', status:'active' },
    { id:'s5', userId:'u9', userName:'Frank Thomas',    role:'student', loginTime: new Date(Date.now()-15*60000).toISOString(),  ip:'10.0.0.55',     device:'Chrome 124 / Windows', status:'active' },
  ],
  auditLog: [
    { id:'a1', userId:'u4', userName:'Alice Johnson',  action:'LOGIN',    timestamp: new Date(Date.now()-30*60000).toISOString(),         ip:'192.168.1.45',  details:'Successful login – new session created' },
    { id:'a2', userId:'u6', userName:'Carol Davis',    action:'LOGIN',    timestamp: new Date(Date.now()-90*60000).toISOString(),         ip:'10.0.0.88',     details:'Successful login' },
    { id:'a3', userId:'u8', userName:'Emma Wilson',    action:'LOGIN',    timestamp: new Date(Date.now()-45*60000).toISOString(),         ip:'192.168.1.102', details:'Successful login' },
    { id:'a4', userId:'u2', userName:'Dr. Sarah Chen', action:'LOGIN',    timestamp: new Date(Date.now()-120*60000).toISOString(),        ip:'10.0.0.24',     details:'Successful login – 2FA verified' },
    { id:'a5', userId:'u7', userName:'David Lee',      action:'DISABLED', timestamp: new Date(Date.now()-2*24*3600000).toISOString(),     ip:'—',             details:'Account disabled by admin (policy violation)' },
    { id:'a6', userId:'u10',userName:'Grace Kim',      action:'LOGIN',    timestamp: new Date(Date.now()-6*3600000).toISOString(),        ip:'192.168.2.10',  details:'Successful login' },
    { id:'a7', userId:'u9', userName:'Frank Thomas',   action:'LOGIN',    timestamp: new Date(Date.now()-15*60000).toISOString(),         ip:'10.0.0.55',     details:'Successful login' },
  ],
};

/* ═══════════════════════════════════
   DATA ACCESS LAYER (localStorage)
═══════════════════════════════════ */
function initMockData() {
  if (!localStorage.getItem('lms_initialized')) {
    localStorage.setItem('lms_users',    JSON.stringify(DEFAULT_DATA.users));
    localStorage.setItem('lms_courses',  JSON.stringify(DEFAULT_DATA.courses));
    localStorage.setItem('lms_progress', JSON.stringify(DEFAULT_DATA.progress));
    localStorage.setItem('lms_notes',    JSON.stringify(DEFAULT_DATA.notes));
    localStorage.setItem('lms_sessions', JSON.stringify(DEFAULT_DATA.sessions));
    localStorage.setItem('lms_audit',    JSON.stringify(DEFAULT_DATA.auditLog));
    localStorage.setItem('lms_initialized', '1');
  }
}

function getUsers()   { return JSON.parse(localStorage.getItem('lms_users')    || '[]'); }
function getCourses() { return JSON.parse(localStorage.getItem('lms_courses')  || '[]'); }
function getProgress(){ return JSON.parse(localStorage.getItem('lms_progress') || '{}'); }
function getNotes()   { return JSON.parse(localStorage.getItem('lms_notes')    || '{}'); }
function getSessions(){ return JSON.parse(localStorage.getItem('lms_sessions') || '[]'); }
function getAudit()   { return JSON.parse(localStorage.getItem('lms_audit')    || '[]'); }

function saveUsers(d)   { localStorage.setItem('lms_users',    JSON.stringify(d)); }
function saveCourses(d) { localStorage.setItem('lms_courses',  JSON.stringify(d)); }
function saveProgress(d){ localStorage.setItem('lms_progress', JSON.stringify(d)); }
function saveNotes(d)   { localStorage.setItem('lms_notes',    JSON.stringify(d)); }
function saveSessions(d){ localStorage.setItem('lms_sessions', JSON.stringify(d)); }
function saveAudit(d)   { localStorage.setItem('lms_audit',    JSON.stringify(d)); }

/* Compute overall course progress % for a user */
function getCourseProgress(userId, courseId) {
  const progress = getProgress();
  const course   = getCourses().find(c => c.id === courseId);
  if (!course || !progress[userId] || !progress[userId][courseId]) return 0;
  const vids = course.videos;
  if (!vids.length) return 0;
  const total = vids.reduce((acc, v) => acc + (progress[userId][courseId][v.id] || 0), 0);
  return Math.round(total / vids.length);
}

/* Get last watched video for a user+course */
function getLastWatchedVideo(userId, courseId) {
  const progress = getProgress();
  const course   = getCourses().find(c => c.id === courseId);
  if (!course || !progress[userId] || !progress[userId][courseId]) return course ? course.videos[0] : null;
  const vids = [...course.videos].sort((a, b) => a.order - b.order);
  for (let i = vids.length - 1; i >= 0; i--) {
    if ((progress[userId][courseId][vids[i].id] || 0) > 0) {
      return i + 1 < vids.length ? vids[i + 1] : vids[i];
    }
  }
  return vids[0];
}

/* Add audit log entry */
function addAuditEntry(userId, userName, action, details, ip) {
  const log = getAudit();
  log.unshift({ id: 'a' + Date.now(), userId, userName, action, timestamp: new Date().toISOString(), ip: ip || '—', details });
  saveAudit(log.slice(0, 50)); // keep last 50
}

/* ═══════════════════════════════════
   SESSION MANAGEMENT
═══════════════════════════════════ */
function getSession() {
  try { return JSON.parse(localStorage.getItem('lms_session')) || null; }
  catch { return null; }
}

function sessionGuard(allowedRoles) {
  const session = getSession();
  if (!session || !session.userId) {
    window.location.href = 'index.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Redirect to correct dashboard
    const map = { student: 'student-dashboard.html', trainer: 'trainer-dashboard.html', admin: 'admin-dashboard.html' };
    window.location.href = map[session.role] || 'index.html';
    return null;
  }
  return session;
}

function logout() {
  // Remove session from active sessions
  const sessions = getSessions().filter(s => s.userId !== (getSession()?.userId));
  saveSessions(sessions);
  localStorage.removeItem('lms_session');
  window.location.href = 'index.html';
}

/* ═══════════════════════════════════
   UI HELPERS
═══════════════════════════════════ */
function renderUserInfo(session) {
  const avatarEl   = document.getElementById('userAvatar');
  const nameEl     = document.getElementById('userName');
  const roleTagEl  = document.getElementById('userRoleTag');
  if (avatarEl)  avatarEl.textContent  = (session.name || '?').charAt(0).toUpperCase();
  if (nameEl)    nameEl.textContent    = session.name  || session.email;
  if (roleTagEl) {
    roleTagEl.textContent  = session.role;
    roleTagEl.className    = `user-role-tag ${session.role}`;
  }
}

// Sidebar nav switching
function initSidebarNav() {
  const links   = document.querySelectorAll('.nav-link[data-section]');
  const sections = document.querySelectorAll('.content-section');
  const breadEl  = document.getElementById('breadcrumb');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.section;

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      sections.forEach(s => {
        s.classList.toggle('active', s.id === 'section-' + target);
      });

      if (breadEl) breadEl.innerHTML = `<strong>${link.querySelector('.nav-label')?.textContent || target}</strong>`;

      // Close mobile sidebar
      const sidebar = document.getElementById('sidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('show');
    });
  });

  // Mobile menu toggle
  const menuBtn  = document.getElementById('menuToggle');
  const sidebar  = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('show');
    });
  }

  // Desktop collapse
  const collapseBtn = document.getElementById('collapseBtn');
  const mainContent = document.querySelector('.main-content');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      if (mainContent) mainContent.classList.toggle('expanded');
      const icon = collapseBtn.querySelector('svg');
      if (icon) icon.style.transform = sidebar.classList.contains('collapsed') ? 'rotate(180deg)' : '';
    });
  }

  // Logout
  document.querySelectorAll('.sidebar-logout, #logoutBtn').forEach(btn => {
    btn.addEventListener('click', logout);
  });
}

/* ── Toast ── */
let _toastTimer = null;
function showToast(msg, type = 'info') {
  let toast = document.getElementById('dashToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dashToast';
    toast.className = 'dash-toast';
    document.body.appendChild(toast);
  }
  clearTimeout(_toastTimer);
  toast.textContent = msg;
  toast.className   = `dash-toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ── Date Formatting ── */
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) + ' ' +
         d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* Generate initials avatar color */
function avatarColor(name) {
  const hues = [210, 260, 340, 160, 30, 180, 290];
  let sum = 0;
  for (const c of (name||'')) sum += c.charCodeAt(0);
  const h = hues[sum % hues.length];
  return `hsl(${h},70%,50%)`;
}

/* ═══════════════════════════════════
   SECURITY FUNCTIONS
═══════════════════════════════════ */
function disableRightClick() {
  document.addEventListener('contextmenu', e => {
    // Allow on non-player areas
    if (!e.target.closest('.player-wrapper')) return;
    e.preventDefault();
    showToast('Right-click is disabled for security.', 'warning');
  });
}

function blockPrintScreen() {
  document.addEventListener('keydown', e => {
    if (e.key === 'PrintScreen' || e.key === 'F13' || (e.ctrlKey && e.shiftKey && e.key === 'S')) {
      e.preventDefault();
      flashWatermark();
      showToast('Screenshot capture is not allowed on this platform.', 'warning');
    }
    // Block Ctrl+P (print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      showToast('Printing is disabled for security.', 'warning');
    }
  });
}

function blockSelectCopy() {
  const playerArea = document.querySelector('.player-wrapper');
  if (!playerArea) return;
  playerArea.addEventListener('selectstart', e => e.preventDefault());
  playerArea.addEventListener('copy', e => e.preventDefault());
}

/* ── Watermark ── */
let _watermarkEl  = null;
let _watermarkInt = null;

function createWatermark(username) {
  const existing = document.getElementById('globalWatermark');
  if (existing) existing.remove();

  _watermarkEl = document.createElement('div');
  _watermarkEl.id        = 'globalWatermark';
  _watermarkEl.className = 'watermark';
  _watermarkEl.textContent = `${username} • EduVerse`;
  _watermarkEl.setAttribute('aria-hidden', 'true');

  const playerWrapper = document.querySelector('.player-wrapper');
  if (playerWrapper) {
    playerWrapper.appendChild(_watermarkEl);
  }
  moveWatermark();

  // Move watermark every 20 seconds
  _watermarkInt = setInterval(moveWatermark, 20000);
}

function moveWatermark() {
  if (!_watermarkEl) return;
  const parent = _watermarkEl.parentElement;
  if (!parent) return;
  const pw = parent.offsetWidth  || 640;
  const ph = parent.offsetHeight || 360;
  const x  = 10 + Math.random() * (pw * 0.5);
  const y  = 10 + Math.random() * (ph * 0.6);
  _watermarkEl.style.left = x + 'px';
  _watermarkEl.style.top  = y + 'px';
  _watermarkEl.style.opacity = (0.08 + Math.random() * 0.06).toString();
}

function flashWatermark() {
  if (!_watermarkEl) return;
  _watermarkEl.style.opacity = '0.45';
  _watermarkEl.style.fontSize = '1.2rem';
  setTimeout(() => {
    _watermarkEl.style.opacity = '0.1';
    _watermarkEl.style.fontSize = '0.85rem';
  }, 1500);
}

function stopWatermark() {
  clearInterval(_watermarkInt);
  if (_watermarkEl) _watermarkEl.remove();
  _watermarkEl = null;
}

/* ═══════════════════════════════════
   MODAL HELPERS
═══════════════════════════════════ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open'); document.body.style.overflow = '';
      });
    }
  });
}

/* ═══════════════════════════════════
   SHARED INIT
═══════════════════════════════════ */
(function dashInit() {
  initMockData();
  disableRightClick();
  blockPrintScreen();
})();
