import { useState } from "react";

import API from "../services/api";

export default function Login() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const response = await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      // save token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // save role
      localStorage.setItem(
        "role",
        response.data.user.role
      );

      alert("Login Successful");

      // role-based navigation
      if (response.data.user.role === "student") {

        window.location.href = "/student";

      } else if (
        response.data.user.role === "trainer"
      ) {

        window.location.href = "/trainer";

      } else {

        window.location.href = "/admin";
      }

    } catch (error) {

      console.log(error);

      alert("Invalid Email or Password");
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
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Login
        </h1>

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

        <button
          onClick={handleLogin}
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
          Login
        </button>
      </div>
    </div>
  );
}