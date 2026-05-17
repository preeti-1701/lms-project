import { useState } from "react";

import API from "../services/api";

export default function Register() {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [role, setRole] = useState("student");

  const handleRegister = async () => {

    try {

      const response = await API.post(
        "/auth/register",
        {
          name,
          email,
          password,
          role,
        }
      );

      alert(response.data.message);

      window.location.href = "/login";

    } catch (error) {

      console.log(error);

      alert("Registration failed");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0b0146",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          backgroundColor: "#111827",
          padding: "40px",
          borderRadius: "15px",
          width: "350px",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          Register
        </h1>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
          }}
        >
          <option value="student">Student</option>

          <option value="trainer">Trainer</option>

          <option value="admin">Admin</option>
        </select>

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}