import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // 🔥 role forced as student
      await API.post("/auth/register", {
        ...form,
        role: "student",
      });

      alert("Registration Student ");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="bg-[#1e293b] p-8 rounded-xl w-96 shadow-lg">
        <h2 className="text-white text-2xl mb-6 text-center">
          Register
        </h2>

        <input
          placeholder="Name"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 p-2 rounded hover:bg-green-600"
        >
          Register
        </button>

        <p
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 mt-4 text-center cursor-pointer"
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}