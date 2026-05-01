import { useEffect, useState } from "react";
import API from "../../services/api";

export default function TrainerDashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videoInput, setVideoInput] = useState("");
  const [newCourse, setNewCourse] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const loadCourses = async () => {
    try {
      const res = await API.get("/courses/all");
      setCourses(res.data || []);
    } catch (err) {
      console.error("Load courses error:", err);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const createCourse = async () => {
    if (!newCourse.trim()) return;
    try {
      await API.post("/courses", { title: newCourse });
      setNewCourse("");
      loadCourses();
    } catch { alert("Error creating course"); }
  };

  const addVideo = async () => {
    if (!videoInput || !selectedCourse) return;
    try {
      await API.post("/videos", { youtubeUrl: videoInput, courseId: selectedCourse.id });
      setVideoInput("");
      const res = await API.get("/courses/all");
      const updated = (res.data || []).find((c) => c.id === selectedCourse.id);
      setSelectedCourse(updated || null);
      setCourses(res.data || []);
    } catch { alert("Error adding video"); }
  };

  const deleteVideo = async (id) => {
    try {
      await API.delete(`/videos/${id}`);
      const updatedVideos = selectedCourse.videos.filter((v) => v.id !== id);
      const updatedCourse = { ...selectedCourse, videos: updatedVideos };
      setSelectedCourse(updatedCourse);
      setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
    } catch { alert("Error deleting video"); }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course?")) return;
    try {
      await API.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setSelectedCourse(null);
    } catch { alert("Error deleting course"); }
  };

  const getVideoId = (url) => {
    if (!url) return "";
    if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1];
    return "";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* HEADER — mobile responsive §5 */}
      <div className="sticky top-0 z-40 bg-[#020617] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg md:text-2xl font-bold text-green-400">🎓 Trainer Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm">Logout</button>
      </div>

      <div className="p-4 md:p-8">
        {/* CREATE COURSE */}
        <div className="bg-[#1e293b] p-4 md:p-6 rounded-xl mb-6 flex gap-2 md:gap-3">
          <input value={newCourse} onChange={(e) => setNewCourse(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createCourse()}
            placeholder="Enter new course name..."
            className="flex-1 p-2 md:p-3 rounded bg-gray-800 text-sm" />
          <button onClick={createCourse} className="bg-green-500 px-3 md:px-5 rounded hover:bg-green-600 text-sm whitespace-nowrap">
            Add Course
          </button>
        </div>

        {courses.length === 0 && <p className="text-gray-400">No courses yet. Create one above.</p>}

        {/* COURSE CARDS — responsive grid §5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {courses.map((course) => (
            <div key={course.id} onClick={() => setSelectedCourse(course)}
              className="bg-[#1e293b] p-4 md:p-6 rounded-xl cursor-pointer hover:scale-105 transition">
              <h2 className="text-lg md:text-xl text-green-400 truncate">{course.title}</h2>
              <p className="text-gray-400 mt-2 text-sm">{course.videos?.length || 0} Videos</p>
              <button onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }}
                className="mt-3 text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700">
                Delete Course
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL — responsive §5 */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-3 md:p-6">
          <div className="bg-[#1e293b] w-full max-w-3xl p-4 md:p-6 rounded-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedCourse(null)} className="absolute top-3 right-3 text-red-400 text-xl">✖</button>
            <h2 className="text-lg md:text-xl text-green-400 mb-4 pr-6 truncate">{selectedCourse.title}</h2>

            <div className="flex gap-2 mb-4">
              <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                placeholder="Paste YouTube link..."
                className="flex-1 p-2 rounded bg-gray-800 text-sm" />
              <button onClick={addVideo} className="bg-blue-500 px-3 rounded hover:bg-blue-600 text-sm whitespace-nowrap">Add</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCourse.videos?.length === 0 && <p className="text-gray-400 text-sm">No videos yet.</p>}
              {selectedCourse.videos?.map((v) => (
                <div key={v.id} className="bg-[#020617] rounded-lg overflow-hidden">
                  <img src={`https://img.youtube.com/vi/${getVideoId(v.youtubeUrl)}/mqdefault.jpg`}
                    className="w-full h-28 md:h-32 object-cover" alt="video thumbnail" />
                  <div className="flex justify-between p-2">
                    <span className="text-xs text-gray-300">Video</span>
                    <button onClick={() => deleteVideo(v.id)} className="bg-red-500 px-2 text-xs rounded hover:bg-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
