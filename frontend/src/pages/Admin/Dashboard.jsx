import { useEffect, useState } from "react";
import API from "../../services/api";
import { getUserFromToken } from "../../utils/helpers";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("admin");
  const [students, setStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  const currentUser = getUserFromToken();
  const currentUserId = currentUser?.userId || "";

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);
  const [videoInput, setVideoInput] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [userMsg, setUserMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const [navOpen, setNavOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const loadData = async () => {
    setError("");
    const [usersRes, courseRes, enrollRes, sessionRes] = await Promise.allSettled([
      API.get("/users"),
      API.get("/courses/all"),
      API.get("/enrollments"),
      API.get("/sessions"),
    ]);

    if (usersRes.status === "fulfilled") {
      const users = usersRes.value?.data || [];
      setAllUsers(users);
      setStudents(users.filter((u) => u.role === "student"));
    }
    if (courseRes.status === "fulfilled") setCourses(courseRes.value?.data || []);
    if (enrollRes.status === "fulfilled") setEnrollments(enrollRes.value?.data || []);
    if (sessionRes.status === "fulfilled") setSessions(sessionRes.value?.data || []);

    const criticalFailed = [usersRes, courseRes, enrollRes].filter(r => r.status === "rejected");
    if (criticalFailed.length === 3) {
      const err = criticalFailed[0].reason;
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Unknown error";
      if (status === 401) setError("Session expired. Please log out and log back in.");
      else if (status === 403) setError("Access denied. Only admins can view this panel.");
      else setError(`Failed to load data: ${msg}`);
    }
  };

  useEffect(() => { loadData(); }, []);

  const assignCourse = async () => {
    if (!selectedUser || !selectedCourse) return alert("Please select both a student and a course");
    try {
      await API.post("/courses/assign", { userId: selectedUser, courseId: selectedCourse });
      alert("Course assigned successfully");
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Assignment failed");
    }
  };

  const createCourse = async () => {
    if (!newCourse.trim()) return;
    try {
      await API.post("/courses", { title: newCourse });
      setNewCourse("");
      loadData();
    } catch { alert("Error creating course"); }
  };

  const addVideo = async () => {
    if (!videoInput || !selectedCourseModal) return;
    try {
      await API.post("/videos", { youtubeUrl: videoInput, courseId: selectedCourseModal.id });
      setVideoInput("");
      loadData();
    } catch { alert("Error adding video"); }
  };

  const deleteVideo = async (id) => {
    try {
      await API.delete(`/videos/${id}`);
      const updatedVideos = selectedCourseModal.videos.filter((v) => v.id !== id);
      const updatedCourse = { ...selectedCourseModal, videos: updatedVideos };
      setSelectedCourseModal(updatedCourse);
      setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    } catch { alert("Error deleting video"); }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course and all its videos/enrollments?")) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setEnrollments((prev) => prev.filter((e) => e.courseId !== id));
      setSelectedCourseModal(null);
    } catch { alert("Error deleting course"); }
  };

  const openEditUser = (user) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const saveEditUser = async () => {
    try {
      await API.patch(`/users/${editUser.id}`, { name: editName, email: editEmail, role: editRole });
      setEditUser(null);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Error updating user");
    }
  };

  const toggleUserActive = async (userId) => {
    if (!currentUserId || userId === currentUserId) return alert("Cannot disable your own account");
    try {
      await API.patch(`/users/${userId}/toggle`);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Error toggling user");
    }
  };
  const forceLogoutUser = async (userId, userName) => {
    if (!currentUserId || userId === currentUserId) return alert("Cannot force logout your own account");
    if (!confirm(`Force logout all sessions for ${userName}?`)) return;
    try {
      await API.delete(`/sessions/user/${userId}`);
      alert(`${userName} has been logged out.`);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Error forcing logout");
    }
  };

  const forceLogoutSession = async (sessionId, sessionUserId) => {
    if (!currentUserId || sessionUserId === currentUserId) return alert("Cannot terminate your own session");
    try {
      await API.put(`/sessions/${sessionId}`);
      loadData();
    } catch { alert("Error logging out session"); }
  };

  const createUser = async () => {
    try {
      setUserMsg("");
      if (!newUser.name || !newUser.email || !newUser.password) {
        return setUserMsg("❌ All fields are required");
      }
      await API.post("/users", newUser);
      setUserMsg("✅ User created successfully");
      setNewUser({ name: "", email: "", password: "", role: "student" });
      loadData();
    } catch (err) {
      setUserMsg("❌ " + (err?.response?.data?.message || "Error creating user"));
    }
  };

  const changePassword = async () => {
    try {
      setPassMsg("");
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        return setPassMsg("❌ Both fields are required");
      }
      await API.post("/users/change-password", passwordForm);
      setPassMsg("✅ Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPassMsg("❌ " + (err?.response?.data?.message || "Error changing password"));
    }
  };

  const getVideoId = (url) => {
    if (!url) return "";
    if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1];
    return "";
  };

  const tabs = [
    { key: "admin", label: "Admin", color: "bg-green-500" },
    { key: "users", label: "Users", color: "bg-orange-500" },
    { key: "sessions", label: "Sessions", color: "bg-cyan-500" },
    { key: "trainer", label: "Courses", color: "bg-blue-500" },
    { key: "student", label: "Students", color: "bg-purple-500" },
  ];

  return (
    <div className="bg-[#0f172a] min-h-screen text-white">

      {/* TOP NAV */}
      <div className="sticky top-0 z-40 bg-[#0f172a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="text-green-400 font-bold text-lg">🎓 Admin</span>
        <div className="hidden md:flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${activeTab === t.key ? t.color : "bg-gray-700 hover:bg-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="md:hidden bg-gray-700 px-3 py-1.5 rounded text-sm" onClick={() => setNavOpen(!navOpen)}>☰</button>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm">Logout</button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {navOpen && (
        <div className="md:hidden bg-[#1e293b] border-b border-white/10 flex flex-col p-2 gap-1 z-30">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setNavOpen(false); }}
              className={`px-4 py-2 rounded text-sm text-left ${activeTab === t.key ? t.color : "bg-gray-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 md:p-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={loadData} className="text-sm underline hover:text-white">Retry</button>
          </div>
        )}

        {/* ===== ADMIN TAB ===== */}
        {activeTab === "admin" && (
          <>
            <h1 className="text-2xl text-green-400 mb-6">Admin Panel</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card title="Students" value={students.length} color="text-green-400" />
              <Card title="Courses" value={courses.length} color="text-blue-400" />
              <Card title="Enrollments" value={enrollments.length} color="text-purple-400" />
              <Card title="Videos" value={courses.reduce((a, c) => a + (c?.videos?.length || 0), 0)} color="text-yellow-400" />
            </div>

            <div className="bg-[#1e293b] p-4 md:p-6 rounded-xl mb-8">
              <h2 className="text-lg mb-4 text-white">Assign Course to Student</h2>
              <select className="w-full p-2 mb-3 bg-gray-800 rounded text-sm"
                value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Select Student</option>
                {students.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <select className="w-full p-2 mb-3 bg-gray-800 rounded text-sm"
                value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">Select Course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <button onClick={assignCourse} className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 text-sm">Assign</button>
            </div>

            <div className="bg-[#1e293b] p-4 md:p-6 rounded-xl">
              <h2 className="text-lg mb-4">All Enrollments</h2>
              {enrollments.length === 0 && <p className="text-gray-400 text-sm">No enrollments yet.</p>}
              <div className="space-y-2">
                {enrollments.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm bg-gray-800 p-2 rounded flex-wrap gap-1">
                    <span className="text-green-300">{e.user?.name || e.userId}</span>
                    <span className="text-blue-300">{e.course?.title || e.courseId}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === "users" && (
          <>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
              <h1 className="text-2xl text-orange-400">User Management</h1>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { setShowChangePassword(true); setPassMsg(""); }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                  Change My Password
                </button>
                <button onClick={() => { setShowCreateUser(true); setUserMsg(""); }}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm">
                  + Create User
                </button>
              </div>
            </div>

            <div className="bg-[#1e293b] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-gray-400">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3 hidden sm:table-cell">Email</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {allUsers.map((u) => (
                      <tr key={u.id} className={!u.isActive ? "opacity-50" : ""}>
                        <td className="p-3 text-white">{u.name}</td>
                        <td className="p-3 text-gray-400 hidden sm:table-cell">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            u.role === "admin" ? "bg-green-500/20 text-green-400" :
                            u.role === "trainer" ? "bg-blue-500/20 text-blue-400" :
                            "bg-purple-500/20 text-purple-400"
                          }`}>{u.role}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {u.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={() => openEditUser(u)}
                              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">
                              Edit
                            </button>
                            {u.id !== currentUserId ? (
                              <>
                                <button onClick={() => toggleUserActive(u.id)}
                                  className={`text-xs px-2 py-1 rounded ${u.isActive ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}`}>
                                  {u.isActive ? "Disable" : "Enable"}
                                </button>
                                <button onClick={() => forceLogoutUser(u.id, u.name)}
                                  className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
                                  Force Logout
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500 italic">You</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== SESSIONS TAB ===== */}
        {activeTab === "sessions" && (
          <>
            <h1 className="text-2xl text-cyan-400 mb-6">Active Sessions</h1>
            <div className="bg-[#1e293b] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-gray-400">
                    <tr>
                      <th className="text-left p-3">User ID</th>
                      <th className="text-left p-3 hidden md:table-cell">Device</th>
                      <th className="text-left p-3 hidden sm:table-cell">IP</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {sessions.map((s) => (
                      <tr key={s.id} className={!s.isActive ? "opacity-40" : ""}>
                        <td className="p-3 text-gray-300 font-mono text-xs">{s.userId?.slice(0, 8)}…</td>
                        <td className="p-3 text-gray-400 text-xs hidden md:table-cell max-w-[200px] truncate">{s.device}</td>
                        <td className="p-3 text-gray-400 hidden sm:table-cell">{s.ip}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${s.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                            {s.isActive ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="p-3">
                          {s.isActive && s.userId !== currentUserId ? (
                            <button onClick={() => forceLogoutSession(s.id, s.userId)}
                              className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded">
                              Terminate
                            </button>
                          ) : s.isActive ? (
                            <span className="text-xs text-gray-500 italic">Your session</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== COURSES TAB ===== */}
        {activeTab === "trainer" && (
          <>
            <h1 className="text-2xl text-blue-400 mb-6">Course Management</h1>
            <div className="bg-[#1e293b] p-4 md:p-6 rounded-xl mb-6 flex gap-2">
              <input value={newCourse} onChange={(e) => setNewCourse(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createCourse()}
                placeholder="Course name..." className="flex-1 p-2 bg-gray-800 rounded text-sm" />
              <button onClick={createCourse} className="bg-green-500 px-4 rounded hover:bg-green-600 text-sm">Add</button>
            </div>
            {courses.length === 0 && <p className="text-gray-400">No courses yet.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c.id} onClick={() => setSelectedCourseModal(c)}
                  className="bg-[#1e293b] p-4 rounded cursor-pointer hover:scale-105 transition">
                  <h2 className="text-green-400">{c.title}</h2>
                  <p className="text-sm text-gray-400">{c?.videos?.length || 0} Videos</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== STUDENTS TAB ===== */}
        {activeTab === "student" && (
          <>
            <h1 className="text-2xl text-purple-400 mb-6">Student Progress</h1>
            {students.length === 0 && <p className="text-gray-400">No students found.</p>}
            {students.map((student) => {
              const studentEnrollments = enrollments.filter((e) => e.userId === student.id);
              const totalWatched = studentEnrollments.reduce((acc, e) =>
                acc + (e?.course?.videos || []).filter((v) => v?.progress?.length > 0).length, 0);
              const totalVideos = studentEnrollments.reduce((acc, e) => acc + (e?.course?.videos?.length || 0), 0);
              const overallPct = totalVideos ? Math.round((totalWatched / totalVideos) * 100) : 0;

              return (
                <div key={student.id} className="mb-8 bg-[#1e293b] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{student.name}</p>
                        <p className="text-gray-400 text-xs">{student.email}</p>
                      </div>
                      <span className={`ml-1 text-xs px-2 py-0.5 rounded ${student.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {student.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-purple-400 font-bold text-lg">{overallPct}%</p>
                      <p className="text-gray-400 text-xs">{totalWatched}/{totalVideos} videos</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-700">
                    <div className="h-1.5 bg-purple-500 transition-all" style={{ width: `${overallPct}%` }} />
                  </div>
                  <div className="p-4 md:p-6">
                    {studentEnrollments.length === 0 && <p className="text-gray-500 text-sm">No courses assigned yet.</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentEnrollments.map((e) => {
                        const videos = e?.course?.videos || [];
                        const watched = videos.filter((v) => v?.progress?.length > 0).length;
                        const percent = videos.length ? Math.round((watched / videos.length) * 100) : 0;
                        const barColor = percent === 100 ? "bg-green-500" : percent > 0 ? "bg-blue-500" : "bg-gray-600";
                        const textColor = percent === 100 ? "text-green-400" : percent > 0 ? "text-blue-400" : "text-gray-400";
                        return (
                          <div key={e.id} className="bg-[#0f172a] rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-white text-sm font-medium pr-2">{e?.course?.title || "Untitled"}</p>
                              <span className={`text-xs font-bold flex-shrink-0 ${textColor}`}>{percent}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded mb-2">
                              <div className={`h-1.5 rounded transition-all ${barColor}`} style={{ width: `${percent}%` }} />
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{watched} / {videos.length} videos watched</p>
                            <div className="flex flex-wrap gap-1.5">
                              {videos.map((v, idx) => {
                                const isWatched = v?.progress?.length > 0;
                                return (
                                  <div key={v.id}
                                    title={`Video ${idx + 1}: ${isWatched ? "Watched" : "Not watched"}`}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isWatched ? "bg-green-500 text-white" : "bg-gray-700 text-gray-500"}`}>
                                    {isWatched ? "✓" : idx + 1}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* COURSE MODAL */}
      {selectedCourseModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-4 md:p-6 w-full max-w-2xl rounded relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedCourseModal(null)} className="absolute top-2 right-3 text-red-400 text-xl">✖</button>
            <div className="flex justify-between items-center mb-4 pr-6">
              <h2 className="text-green-400 text-lg">{selectedCourseModal.title}</h2>
              <button onClick={() => deleteCourse(selectedCourseModal.id)} className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700">Delete</button>
            </div>
            <div className="flex gap-2 mb-4">
              <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                placeholder="YouTube link" className="flex-1 p-2 bg-gray-800 rounded text-sm" />
              <button onClick={addVideo} className="bg-blue-500 px-3 rounded hover:bg-blue-600 text-sm">Add</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCourseModal?.videos?.length === 0 && <p className="text-gray-400 text-sm">No videos yet.</p>}
              {selectedCourseModal?.videos?.map((v) => (
                <div key={v.id}>
                  <img src={`https://img.youtube.com/vi/${getVideoId(v.youtubeUrl)}/mqdefault.jpg`}
                    className="w-full h-28 object-cover rounded" alt="thumbnail" />
                  <button onClick={() => deleteVideo(v.id)} className="bg-red-500 text-xs mt-1 px-2 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-6 w-full max-w-md rounded relative">
            <button onClick={() => setEditUser(null)} className="absolute top-2 right-3 text-red-400 text-xl">✖</button>
            <h2 className="text-orange-400 text-lg mb-4">Edit User</h2>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Role</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                  className="w-full p-2 bg-gray-800 rounded text-sm">
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={saveEditUser} className="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded text-sm">Save Changes</button>
                <button onClick={() => setEditUser(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-6 w-full max-w-md rounded-xl relative">
            <button onClick={() => { setShowCreateUser(false); setUserMsg(""); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">✖</button>
            <h2 className="text-lg text-green-400 mb-4">Create New User</h2>
            {userMsg && (
              <div className={`text-sm px-3 py-2 rounded mb-3 ${userMsg.startsWith("✅") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                {userMsg}
              </div>
            )}
            <input placeholder="Full Name" value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 mb-3 bg-gray-800 rounded text-white text-sm" />
            <input placeholder="Email" value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 mb-3 bg-gray-800 rounded text-white text-sm" />
            <input placeholder="Password" type="password" value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full p-2 mb-3 bg-gray-800 rounded text-white text-sm" />
            <select value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-800 rounded text-white text-sm">
              <option value="student">Student</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={createUser}
              className="w-full bg-green-500 hover:bg-green-600 py-2 rounded font-medium text-sm">
              Create User
            </button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#1e293b] p-6 w-full max-w-md rounded-xl relative">
            <button onClick={() => { setShowChangePassword(false); setPassMsg(""); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">✖</button>
            <h2 className="text-lg text-blue-400 mb-4">Change Password</h2>
            {passMsg && (
              <div className={`text-sm px-3 py-2 rounded mb-3 ${passMsg.startsWith("✅") ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                {passMsg}
              </div>
            )}
            <input placeholder="Current Password" type="password" value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full p-2 mb-3 bg-gray-800 rounded text-white text-sm" />
            <input placeholder="New Password (min 6 chars)" type="password" value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full p-2 mb-4 bg-gray-800 rounded text-white text-sm" />
            <button onClick={changePassword}
              className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded font-medium text-sm">
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="bg-[#1e293b] p-4 md:p-5 rounded-xl">
      <p className="text-gray-400 text-xs md:text-sm">{title}</p>
      <h2 className={`text-xl md:text-2xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}