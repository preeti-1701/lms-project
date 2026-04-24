export default function StudentTable({ students }) {
  return (
    <table className="w-full bg-white rounded shadow mt-6">
      <thead>
        <tr className="text-left text-sm text-gray-500">
          <th className="p-3">Name</th>
          <th>Course</th>
          <th>Progress</th>
          <th>Last Active</th>
        </tr>
      </thead>

      <tbody>
        {students.map((s, i) => (
          <tr key={i} className="border-t">
            <td className="p-3">{s.name}</td>
            <td>{s.course}</td>
            <td>{s.progress}%</td>
            <td>{s.lastActive}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}