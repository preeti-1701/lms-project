import { useContext, useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import { AppContext } from "../context/AppContext";

export default function StudentDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  const isStudent = user?.role === "student";

  async function load() {
    setMessage("");
    const [c, e] = await Promise.all([ctx.api.courses.list(), ctx.api.courses.myEnrollments()]);
    setCourses(c);
    setEnrollments(e);
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        await load();
      } catch (e) {
        if (!cancelled) setMessage(e?.message || "Failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((x) => String(x.course?.id))), [enrollments]);

  async function handleEnroll(courseId) {
    setMessage("");
    await ctx.api.courses.enroll(courseId);
    await load();
  }

  async function handleViewItems(courseId) {
    setMessage("");
    setSelectedCourseId(String(courseId));
    const course = courses.find((c) => String(c.id) === String(courseId));
    setSelectedCourse(course);
    try {
      const data = await ctx.api.courses.items(courseId);
      setItems(data);
    } catch (e) {
      setItems([]);
      setMessage(e?.message || "Unable to load items");
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login to access your dashboard.</p>
          <a href="/login" className="btn btn-primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!isStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This dashboard is for students only. Your role: <span className="font-semibold">{user.role}</span>
          </p>
          <a href="/" className="btn btn-primary">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="flex-grow py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-secondary mb-2">Welcome back, {user.email || user.username}!</h1>
            <p className="text-gray-600">Continue your learning journey and explore new courses</p>
          </div>

          {message && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{message}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Courses Section */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-secondary mb-6">Available Courses</h2>
                {courses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <p className="text-gray-500 text-lg">No courses available yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((c) => {
                      const enrolled = enrolledCourseIds.has(String(c.id));
                      return (
                        <CourseCard
                          key={c.id}
                          course={c}
                          isEnrolled={enrolled}
                          onEnroll={handleEnroll}
                          onView={handleViewItems}
                          disabled={false}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Course Content Section */}
              {selectedCourse && (
                <div className="card p-8">
                  <h2 className="text-2xl font-bold text-secondary mb-2">{selectedCourse.title}</h2>
                  <p className="text-gray-600 mb-6">{selectedCourse.description}</p>

                  {items.length === 0 ? (
                    <p className="text-gray-500">No lessons available in this course yet.</p>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-secondary mb-4">Course Lessons</h3>
                      {items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start gap-4">
                            <div
                              className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
                              style={{ background: "rgba(79,70,229,0.1)" }}
                            >
                              <PlayCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-semibold text-secondary">
                                    {idx + 1}. {item.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                </div>
                                <span className="badge badge-primary text-xs whitespace-nowrap">{item.hours}h</span>
                              </div>

                              <a
                                href={item.youtube_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-primary hover:underline font-medium">
                                <PlayCircle className="w-4 h-4" />
                                Watch Lesson
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Stats */}
              <div className="card p-6 mb-6">
                <h3 className="font-bold text-secondary mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Enrolled Courses</span>
                      <span className="font-bold text-primary">{enrollments.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(enrollments.length / Math.max(courses.length, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Enrollments */}
              <div className="card p-6">
                <h3 className="font-bold text-secondary mb-4">My Courses</h3>
                {enrollments.length === 0 ? (
                  <p className="text-gray-500 text-sm">You haven't enrolled in any courses yet.</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <button
                        key={enrollment.course?.id}
                        onClick={() => handleViewItems(enrollment.course?.id)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          String(selectedCourseId) === String(enrollment.course?.id)
                            ? "border-2 bg-indigo-50"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}>
                        <p className="font-medium text-sm text-secondary">{enrollment.course?.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{enrollment.course?.total_hours} hours</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
