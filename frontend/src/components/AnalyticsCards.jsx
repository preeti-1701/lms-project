export default function AnalyticsCards({ courses }) {
  const total = courses.length;
  const avg =
    courses.reduce((acc, c) => acc + (c.progress || 0), 0) /
    (courses.length || 1);

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Total Courses</p>
        <h2 className="text-xl font-bold">{total}</h2>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Avg Completion</p>
        <h2 className="text-xl font-bold">{avg.toFixed(1)}%</h2>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Top Course</p>
        <h2 className="text-xl font-bold">
          {courses[0]?.title || "N/A"}
        </h2>
      </div>

    </div>
  );
}