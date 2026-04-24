export default function Navbar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold">🎓 LMS</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}