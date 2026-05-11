import { useState } from "react";
import API from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.access);

      alert("Login Successful");
    } catch (err) {
      alert("Login Failed");
    }
  };

  return (
    <div className="flex flex-col items-center mt-40 gap-4">
      <h1 className="text-3xl font-bold">LMS Login</h1>

      <input
        className="border p-2"
        type="text"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}

export default Login;