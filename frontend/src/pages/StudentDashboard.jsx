import { useContext, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import { AppContext } from "../context/AppContext";
import { formatHoursMinutes } from "../utils/duration";

function AccessMessage({ title, message, to = "/" }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <Link to={to} className="btn btn-primary mt-6">
            Go Back
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function StudentDashboard() {
  const ctx = useContext(AppContext);
  const user = ctx.auth.user;

  if (!user) return <AccessMessage title="Access Denied" message="Please login to access your dashboard." to="/login" />;
  if (user.role !== "student") {
    return <AccessMessage title="Access Denied" message={`This dashboard is for students only. Your role: ${user.role}`} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-grow px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-secondary">Welcome back, {user.email || user.username}!</h1>
            <p className="mt-2 text-gray-600">Continue your learning journey and explore new courses</p>
          </div>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function useStudentData() {
  const ctx = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    setMessage("");
    const [courseData, enrollmentData] = await Promise.all([ctx.api.courses.list(), ctx.api.courses.myEnrollments()]);
    setCourses(courseData);
    setEnrollments(enrollmentData);
  }

  useEffect(() => {
    let cancelled = false;
    load().catch((e) => {
      if (!cancelled) setMessage(e?.message || "Failed to load");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.auth.user?.id]);

  return { ctx, courses, enrollments, message, load };
}

export function StudentCoursesPage() {
  const { ctx, courses, enrollments, message, load } = useStudentData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((x) => String(x.course?.id))), [enrollments]);
  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      const searchableText = [
        course.title,
        course.description,
        course.status,
        formatHoursMinutes(course.total_hours),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [courses, searchTerm]);

  async function handleEnroll(courseId) {
    await ctx.api.courses.enroll(courseId);
    await load();
    navigate(`/studentDashboard/courses/${courseId}`);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Available Courses</h2>
            <p className="mt-1 text-sm text-gray-600">Search by course title, description, status, or duration.</p>
          </div>
          <label className="w-full sm:max-w-sm">
            <span className="mb-2 block text-sm font-medium text-gray-700">Search courses</span>
            <input
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              type="search"
            />
          </label>
        </div>
        {message ? <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{message}</div> : null}
        {courses.length === 0 ? (
          <div className="rounded-lg bg-white py-12 text-center">
            <p className="text-lg text-gray-500">No courses available yet</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-lg bg-white py-12 text-center">
            <p className="text-lg text-gray-500">No courses match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredCourses.map((course) => {
              const enrolled = enrolledCourseIds.has(String(course.id));
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolled}
                  onEnroll={handleEnroll}
                  onView={(courseId) => navigate(`/studentDashboard/courses/${courseId}`)}
                  disabled={false}
                />
              );
            })}
          </div>
        )}
      </section>

      <aside>
        <div className="card mb-6 p-6">
          <h3 className="mb-4 font-bold text-secondary">Your Progress</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Enrolled Courses</span>
            <span className="font-bold text-primary">{enrollments.length}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${(enrollments.length / Math.max(courses.length, 1)) * 100}%` }} />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-bold text-secondary">My Courses</h3>
          <p className="text-sm text-gray-500">
            View your enrolled courses on a dedicated page.
          </p>
          <Link to="/studentDashboard/my-courses" className="btn btn-primary mt-5 w-full">
            Open My Courses
          </Link>
        </div>
      </aside>
    </div>
  );
}

export function StudentMyCoursesPage() {
  const { enrollments, message } = useStudentData();

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary">My Courses</h2>
          <p className="mt-1 text-gray-600">Courses you are currently enrolled in.</p>
        </div>
        <Link to="/studentDashboard" className="btn btn-outline">
          Browse Courses
        </Link>
      </div>

      {message ? <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">{message}</div> : null}

      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
          <Link to="/studentDashboard" className="btn btn-primary mt-5">
            Find a Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.course?.id}
              to={`/studentDashboard/courses/${enrollment.course?.id}`}
              className="card p-5 hover:border-gray-400">
              <h3 className="font-bold text-secondary line-clamp-2">{enrollment.course?.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{enrollment.course?.description}</p>
              <p className="mt-4 text-sm text-gray-500">{formatHoursMinutes(enrollment.course?.total_hours)}</p>
              <p className="mt-2 text-xs text-gray-500">
                Enrolled: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : "-"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function StudentCourseDetailPage() {
  const ctx = useContext(AppContext);
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([ctx.api.courses.get(courseId), ctx.api.courses.items(courseId)])
      .then(([courseData, itemData]) => {
        if (cancelled) return;
        setCourse(courseData);
        setItems(itemData);
      })
      .catch((e) => {
        if (!cancelled) setMessage(e?.message || "Unable to load course");
      });
    return () => {
      cancelled = true;
    };
  }, [ctx.api.courses, courseId]);

  if (message) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {message}
        <button className="btn btn-primary ml-4" onClick={() => navigate("/studentDashboard")}>
          Browse Courses
        </button>
      </div>
    );
  }
  if (!course) return <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">Loading course...</div>;

  return (
    <section className="card p-8">
      <Link to="/studentDashboard" className="text-sm font-medium text-primary hover:underline">
        Back to courses
      </Link>
      <h2 className="mt-4 text-2xl font-bold text-secondary">{course.title}</h2>
      <p className="mt-2 text-gray-600">{course.description}</p>
      <p className="mt-2 text-sm text-gray-500">{formatHoursMinutes(course.total_hours)}</p>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-secondary">Course Lessons</h3>
        {items.length === 0 ? (
          <p className="text-gray-500">No lessons available in this course yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(79,70,229,0.1)" }}>
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-secondary">
                        {idx + 1}. {item.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                    </div>
                    <span className="badge badge-primary text-xs whitespace-nowrap">{formatHoursMinutes(item.hours)}</span>
                  </div>
                  <a href={item.youtube_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-medium text-primary hover:underline">
                    <PlayCircle className="h-4 w-4" />
                    Watch Lesson
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
