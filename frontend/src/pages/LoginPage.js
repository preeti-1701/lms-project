import React, { useState } from "react";
import API from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("RESPONSE:", res.data); // 🔍 DEBUG

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // redirect
      window.location.href = "/admin";

    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      setError("Unable to login");
    }
  };

  return (
    <div>
      <h2>LMS Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;