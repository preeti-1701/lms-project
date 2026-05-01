import { useState } from "react";
import { loginUser } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/helpers";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token);

      const user = getUserFromToken();
      if (user.role !== role) {
        localStorage.removeItem("token");
        setError("Wrong role selected. Please choose the correct role.");
        return;
      }

      if (role === "admin") navigate("/admin");
      else if (role === "trainer") navigate("/trainer");
      else navigate("/student");
    } catch (err) {
      // 🔴 Show exact error from backend (disabled account, wrong password, etc.)
      const msg = err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="bg-[#1e293b] p-8 rounded-xl w-80 text-white">
        <h2 className="text-2xl mb-6 text-center font-bold text-green-400">🎓 LMS Login</h2>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <select
          className="w-full p-2 mb-3 bg-gray-800 rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="trainer">Trainer</option>
          <option value="admin">Admin</option>
        </select>

        <input
          className="w-full p-2 mb-3 bg-gray-800 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          type="password"
          placeholder="Password"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-500 p-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          onClick={() => navigate("/register")}
          className="text-sm text-gray-400 mt-4 text-center cursor-pointer hover:text-white"
        >
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}