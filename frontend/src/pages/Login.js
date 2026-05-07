import { useState } from "react";

import axios from "axios";

import { useNavigate }
from "react-router-dom";

import "./Login.css";

export default function Login() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const navigate = useNavigate();

  const login = async () => {

    try {

      const res = await axios.post(

        "http://127.0.0.1:8000/api/users/login/",

        {

          username,

          password
        }
      );

      localStorage.setItem(
        "token",
        res.data.access
      );

      localStorage.setItem(
        "role",
        res.data.role
      );

      localStorage.setItem(
        "user_id",
        res.data.user_id
      );

      localStorage.setItem(
        "username",
        username
      );

      if (
        res.data.role === "admin"
      ) {

        navigate(
          "/admin-dashboard"
        );
      }

      else if (
        res.data.role === "trainer"
      ) {

        navigate(
          "/trainer-dashboard"
        );
      }

      else {

        navigate(
          "/student-dashboard"
        );
      }

    }

    catch {

      alert(
        "Invalid Credentials"
      );
    }
  };

  return (

    <div className="login-container">

      <div className="login-card">

        <h2>
          LMS Login
        </h2>

        <input

          placeholder="Username"

          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
        />

        <input

          type="password"

          placeholder="Password"

          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <button onClick={login}>
          Login
        </button>

      </div>

    </div>
  );
}