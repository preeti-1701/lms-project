export default function Sidebar({
  courses = [],
  onSelectCourse,
  activeCourseId,
}) {
  return (
    <div className="w-64 bg-[#020617] text-white p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 text-green-400">LMS</h2>

      {/* Navigation */}
      <div className="space-y-4 mb-10">
        <p className="hover:text-green-400 cursor-pointer">
          My Courses
        </p>
      </div>

      {/* 🔥 Assigned Courses */}
      <div className="space-y-3">
        <p className="text-gray-400 text-sm">Assigned Courses</p>

        {courses.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No courses assigned
          </p>
        ) : (
          courses.map((course) => (
            <p
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className={`cursor-pointer transition ${
                activeCourseId === course.id
                  ? "text-green-400 font-semibold"
                  : "hover:text-green-400"
              }`}
            >
              {course.title}
            </p>
          ))
        )}
      </div>
    </div>
  );
}