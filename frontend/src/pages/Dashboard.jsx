import { useEffect, useState } from "react";
import API from "../services/api";
import CourseModal from "../components/CourseModal";
import AnalyticsCards from "../components/AnalyticsCards";
import CourseFormModal from "../components/CourseFormModal";
import { useNavigate } from "react-router-dom";

const FILTERS = ["all", "in-progress", "completed", "not-started"];

const TAG_LABELS = {
  completed: "Completed",
  "in-progress": "In Progress",
  "not-started": "Not Started",
};

const TAG_STYLES = {
  completed: "bg-[#e6f4ea] text-green-700",
  "in-progress": "bg-[#fff3cd] text-[#5c3d00]",
  "not-started": "bg-gray-100 text-gray-500",
};

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const role = localStorage.getItem("role");

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  const navigate = useNavigate();

  const fetchCourses = () => {
    setLoading(true);
    API.get("/users/courses/")
      .then((res) => setCourses(res.data))
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const filtered =
    filter === "all" ? courses : courses.filter((c) => c.tag === filter);

  return (
    <div className="min-h-screen bg-[#fff8e1]">

      {/* HEADER */}
      <header className="bg-[#fff3cd] border-b border-gray-200 px-7 h-[65px] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#5c3d00] rounded-lg flex items-center justify-center">
            <GridIcon />
          </div>
          <span className="font-serif text-lg tracking-tight">
            LMS Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fff8e1] border border-gray-200 rounded-full">
            <div className="w-[24px] h-[24px] rounded-full bg-[#5c3d00] flex items-center justify-center text-white text-xs font-semibold">
              {role?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-[#fff3cd] text-[#5c3d00] px-4 py-2 rounded-full text-sm font-medium hover:bg-[#f1e1a6] transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-7 py-8">

        {/* TITLE */}
        <div className="flex items-end justify-between mb-7 flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">
              My Learning
            </p>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#5c3d00]">
              Your Courses
            </h1>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex bg-[#fff3cd] border border-gray-200 rounded-lg overflow-hidden">
              {["grid", "list"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm ${
                    view === v
                      ? "bg-[#5c3d00] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {v === "grid" ? <GridIcon2 /> : <ListIcon />}
                </button>
              ))}
            </div>

            {role === "admin" && (
              <button
                onClick={() => {
                  setEditCourse(null);
                  setShowAddModal(true);
                }}
                className="bg-[#d4a017] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#b58900]"
              >
                + Add Course
              </button>
            )}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm border ${
                filter === f
                  ? "bg-[#d4a017] text-white border-[#d4a017]"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {f === "all" ? `All (${courses.length})` : TAG_LABELS[f]}
            </button>
          ))}
        </div>

        <AnalyticsCards courses={courses} />

        {/* STATES */}
        {loading && (
          <p className="text-center text-gray-500 py-20 text-lg">
            Loading courses…
          </p>
        )}
        {error && (
          <p className="text-center text-red-500 py-10">{error}</p>
        )}

        {/* GRID */}
        {!loading && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                view={view}
                role={role}
                setEditCourse={setEditCourse}
                onContinue={() => navigate(`/course/${course.id}`)}
                refresh={fetchCourses}
              />
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-500">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-lg">No courses found</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL */}
      {(showAddModal || editCourse) && (
        <CourseFormModal
          onClose={() => {
            setShowAddModal(false);
            setEditCourse(null);
          }}
          course={editCourse}
          refresh={fetchCourses}
        />
      )}
    </div>
  );
}

function CourseCard({ course, view, role, setEditCourse, onContinue,refresh }) {
  const pct = course.progress ?? 0;
  const tag = course.tag || "not-started";

  return (
    <div className={`bg-[#fffdf5] rounded-2xl border border-gray-200 overflow-hidden flex ${view === "list" ? "flex-row" : "flex-col"}`}>
      
      <div
        className={`p-5 flex justify-between ${
          view === "list" ? "w-48 items-center justify-center" : ""
        }`}
        style={{ background: course.color || "#fff3cd" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
          style={{ background: course.accent || "#5c3d00" }}
        >
          {course.abbr || "CS"}
        </div>

        {view === "grid" && (
          <span className={`text-xs px-2 py-1 rounded-full ${TAG_STYLES[tag]}`}>
            {TAG_LABELS[tag]}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-serif text-lg font-semibold mb-2 text-[#5c3d00]">
          {course.title}
        </h2>

        <p className="text-sm text-gray-600 mb-3">
          {course.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>

          <div className="h-1 bg-gray-100 rounded-full">
            <div
              className="h-full"
              style={{
                width: `${pct}%`,
                background: "#d4a017",
              }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
            className="flex-1 bg-[#5c3d00] text-white py-2 rounded-lg text-sm"
          >
            {pct === 100 ? "Review" : "Continue"}
          </button>

          {role === "admin" && (
  <>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setEditCourse(course);
      }}
      className="px-3 py-2 border border-[#d4a017] text-sm rounded-lg hover:bg-[#fff3cd] transition"
    >
      Edit
    </button>

    <button
      onClick={async (e) => {
        e.stopPropagation();

        const confirmDelete = window.confirm("Delete this course?");
        if (!confirmDelete) return;

        try {
          await API.delete(`/users/delete-course/${course.id}/`);
          window.location.reload(); // quick refresh
        } catch (err) {
          console.log(err);
          alert("Delete failed");
        }
      }}
      className="px-3 py-2 border border-red-400 text-red-600 text-sm rounded-lg hover:bg-red-50 transition"
    >
      Delete
    </button>
  </>
)}
        </div>
      </div>
    </div>
  );
}

function GridIcon() {
  return <span className="text-white text-xs">▦</span>;
}

function GridIcon2() {
  return <span>▦</span>;
}

function ListIcon() {
  return <span>☰</span>;
}