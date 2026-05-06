import { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();


  const handleLogin = async () => {

    setLoading(true);
    setError("");

    try {

      // ✅ Login
      const res = await axios.post(
        "token/",
        {
          username,
          password,
        }
      );

      const access = res.data.access;
      const refresh = res.data.refresh;

      // ✅ Save tokens
      if (remember) {

        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

      } else {

        sessionStorage.setItem("access", access);
        sessionStorage.setItem("refresh", refresh);
      }

      // ✅ Get user info
      const userRes = await axios.get("user/");

      localStorage.setItem(
        "isAdmin",
        userRes.data.is_staff
      );

      // ✅ Navigate
      navigate("/dashboard");

    } catch (err) {

      console.log(err);

      setError("Invalid username or password");

    } finally {

      setLoading(false);
    }
  };


  const handleKeyPress = (e) => {

    if (e.key === "Enter") {
      handleLogin();
    }
  };


  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >

      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "30px",
          textAlign: "center",
        }}
      >

        <h2 style={{ marginBottom: "20px" }}>
          Welcome Back
        </h2>

        {/* Username */}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyPress}
          className="input"
        />

        {/* Password */}
        <div style={{ position: "relative" }}>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="input"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>

        </div>

        {/* Remember */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            marginBottom: "15px",
            color: "#e0e0e0",
          }}
        >

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              style={{
                width: "16px",
                height: "16px",
                accentColor: "#6366f1",
              }}
            />

            <span>Remember me</span>

          </label>

          <span
            style={{
              cursor: "pointer",
              color: "#c7d2fe",
            }}
          >
            Forgot password?
          </span>

        </div>

        {/* Error */}
        {error && (

          <p
            style={{
              color: "#f87171",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-btn"
        >

          {loading ? "Logging in..." : "Login"}

        </button>

        <p
          style={{
            marginTop: "15px",
            fontSize: "13px",
            opacity: 0.7,
          }}
        >
          LMS Platform © 2026
        </p>

      </div>

    </div>
  );
}

export default Login;