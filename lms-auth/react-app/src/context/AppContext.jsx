import React, { createContext, useState, useCallback, useEffect } from 'react';
import {
  apiLogin, apiLogout, apiMe,
  apiRegisterStudent, apiRegisterTrainer,
  apiGetCourses,
  apiCreateCourse, apiUpdateCourse, apiDeleteCourse,
  apiAddVideo, apiDeleteVideo,
  apiGetEnrollments, apiEnroll, apiUnenroll,
  apiGetProgress, apiMarkWatched,
  apiGetAllUsers, apiCreateUser, apiToggleUserStatus, apiAssignCourses,
  apiGetAuditLog,
} from '../api';

const AppContext = createContext(null);

// ── tiny helpers (kept for UI formatting) ─────────────────────────────────────
const fmtDate     = (iso) => new Date(iso).toLocaleDateString('en-IN',  { day:'2-digit', month:'short', year:'numeric' });
const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-IN',      { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null);
  const [users,       setUsers]         = useState([]);
  const [courses,     setCourses]       = useState([]);
  const [enrollments, setEnrollments]   = useState([]);   // student's enrolled courses
  const [auditLog,    setAuditLog]      = useState([]);
  const [progress,    setProgress]      = useState({});   // { courseId: { progress, watched, total } }
  const [loading,     setLoading]       = useState(true);
  const [toast,       setToast]         = useState({ msg:'', type:'', show: false });

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }, []);

  // ── Bootstrap: restore session from stored token ───────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (!token) { setLoading(false); return; }

    apiMe().then(res => {
      if (res.ok) {
        setCurrentUser(res.data);
        loadRoleData(res.data);
      } else {
        localStorage.removeItem('lms_token');
      }
      setLoading(false);
    });
  }, []); // eslint-disable-line

  // ── Load shared courses ────────────────────────────────────────────────────
  useEffect(() => {
    apiGetCourses().then(res => {
      if (res.ok) setCourses(res.data);
    });
  }, []);

  // ── Load role-specific data after login ────────────────────────────────────
  async function loadRoleData(user) {
    if (!user) return;
    if (user.role === 'student') {
      const [enrollRes] = await Promise.all([apiGetEnrollments()]);
      if (enrollRes.ok) {
        setEnrollments(enrollRes.data);
        const courseIds = enrollRes.data.map(e => e.course?.id).filter(Boolean);
        if (courseIds.length) {
          const progressResults = await Promise.all(
            courseIds.map(async (courseId) => {
              const pres = await apiGetProgress(courseId);
              return [courseId, pres.ok ? pres.data : { progress: 0, watched: 0, total: 0 }];
            })
          );
          setProgress(Object.fromEntries(progressResults));
        }
      }
    }
    if (user.role === 'admin') {
      const [usersRes, auditRes] = await Promise.all([apiGetAllUsers(), apiGetAuditLog()]);
      if (usersRes.ok) setUsers(usersRes.data);
      if (auditRes.ok) setAuditLog(auditRes.data);
    }
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password, role) => {
    const res = await apiLogin(identifier, password, role);
    if (!res.ok) return { ok: false, msg: res.msg };
    localStorage.setItem('lms_token', res.data.token);
    const user = res.data.user;
    setCurrentUser(user);
    // Refresh global courses after login
    const coursesRes = await apiGetCourses();
    if (coursesRes.ok) setCourses(coursesRes.data);
    await loadRoleData(user);
    return { ok: true, user };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem('lms_token');
    setCurrentUser(null);
    setUsers([]);
    setEnrollments([]);
    setAuditLog([]);
    setProgress({});
  }, []);

  const registerStudent = useCallback(async (data) => {
    const res = await apiRegisterStudent(data);
    if (!res.ok) return { ok: false, msg: res.msg };
    showToast('Account created! Please sign in.', 'success');
    return { ok: true };
  }, [showToast]);

  const registerTeacher = useCallback(async (data) => {
    const res = await apiRegisterTrainer(data);
    if (!res.ok) return { ok: false, msg: res.msg };
    showToast('Application submitted! Await verification.', 'success');
    return { ok: true };
  }, [showToast]);

  // ── Progress ───────────────────────────────────────────────────────────────
  const fetchCourseProgress = useCallback(async (courseId) => {
    const res = await apiGetProgress(courseId);
    if (!res.ok) return 0;
    setProgress(p => ({ ...p, [courseId]: res.data }));
    return res.data.progress ?? 0;
  }, []);

  const getCourseProgress = useCallback((userId, courseId) => {
    // userId kept for signature compatibility with existing components.
    return progress[courseId]?.progress ?? 0;
  }, [progress]);

  const markVideoWatched = useCallback(async (userId, courseId, videoId) => {
    const res = await apiMarkWatched(videoId);
    if (res.ok) {
      // Refresh progress for this course
      const pres = await apiGetProgress(courseId);
      if (pres.ok) setProgress(p => ({ ...p, [courseId]: pres.data }));
    }
  }, []);

  // Synchronous version for VideoPlayer (falls back to cached value)
  const getProgress = useCallback((userId) => {
    // Returns the cached progress map
    return Object.fromEntries(
      Object.entries(progress).map(([cid, v]) => [cid, v])
    );
  }, [progress]);

  // ── Courses ────────────────────────────────────────────────────────────────
  const createCourse = useCallback(async (trainerId, trainerName, data) => {
    const res = await apiCreateCourse(data);
    if (!res.ok) { showToast(res.msg, 'error'); return null; }
    const refreshed = await apiGetCourses();
    if (refreshed.ok) setCourses(refreshed.data);
    showToast('Course created!', 'success');
    return res.data;
  }, [showToast]);

  const addVideo = useCallback(async (courseId, data) => {
    const res = await apiAddVideo(courseId, data);
    if (!res.ok) { showToast(res.msg, 'error'); return; }
    const refreshed = await apiGetCourses();
    if (refreshed.ok) setCourses(refreshed.data);
    showToast('Video added!', 'success');
  }, [showToast]);

  const deleteVideo = useCallback(async (courseId, videoId) => {
    const res = await apiDeleteVideo(videoId);
    if (!res.ok) { showToast(res.msg, 'error'); return; }
    const refreshed = await apiGetCourses();
    if (refreshed.ok) setCourses(refreshed.data);
  }, [showToast]);

  // ── Enrollments ────────────────────────────────────────────────────────────
  const enrollCourse = useCallback(async (courseId) => {
    const res = await apiEnroll(courseId);
    if (!res.ok) { showToast(res.msg, 'error'); return; }
    const refreshed = await apiGetEnrollments();
    if (refreshed.ok) setEnrollments(refreshed.data);
    showToast('Enrolled successfully!', 'success');
  }, [showToast]);

  const unenrollCourse = useCallback(async (courseId) => {
    const res = await apiUnenroll(courseId);
    if (!res.ok) { showToast(res.msg, 'error'); return; }
    setEnrollments(e => e.filter(en => en.course.id !== courseId));
  }, [showToast]);

  // ── Admin ──────────────────────────────────────────────────────────────────
  const createUser = useCallback(async (data) => {
    const res = await apiCreateUser(data);
    if (!res.ok) return { ok: false, msg: res.msg };
    const refreshed = await apiGetAllUsers();
    if (refreshed.ok) setUsers(refreshed.data);
    showToast('User created!', 'success');
    return { ok: true };
  }, [showToast]);

  const toggleUserStatus = useCallback(async (userId) => {
    const res = await apiToggleUserStatus(userId);
    if (!res.ok) { showToast(res.msg, 'error'); return; }
    setUsers(u => u.map(x => x.id === userId ? { ...x, status: res.data.status } : x));
    showToast('User status updated.', 'success');
  }, [showToast]);

  const assignCourses = useCallback(async (userId, courseIds) => {
    const res = await apiAssignCourses(userId, courseIds);
    if (!res.ok) { showToast(res.msg, 'error'); return; }
    showToast('Courses assigned!', 'success');
  }, [showToast]);

  // Stubs kept so existing Admin dashboard code doesn't break
  const forceLogout    = useCallback(() => showToast('Session management handled server-side.', 'info'), [showToast]);
  const forceLogoutAll = useCallback(() => showToast('Session management handled server-side.', 'info'), [showToast]);
  const sessions       = [];  // No longer managed client-side

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // State
    currentUser, users, courses, enrollments, sessions, auditLog, loading,
    toast, showToast,
    // Auth
    login, logout, registerStudent, registerTeacher,
    // Progress
    getProgress, markVideoWatched, getCourseProgress, fetchCourseProgress,
    // Courses
    createCourse, addVideo, deleteVideo,
    // Enrollments
    enrollCourse, unenrollCourse,
    // Admin
    createUser, toggleUserStatus, forceLogout, forceLogoutAll, assignCourses,
    // Formatters
    fmtDate, fmtDateTime, getYouTubeId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };
