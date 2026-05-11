import { useState } from "react";
import styles from "../styles";

function Login({ setToken, setRole }) {

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // LOGIN
  const handleLogin = async () => {

    // VALIDATION
    if (!username || !password) {

      alert("Please fill all fields");

      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/login/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            username,
            password,

            // DEVICE TRACKING
            device: navigator.userAgent,
          }),
        }
      );

      const data = await res.json();

      if (data.token) {

        // SAVE STATE
        setToken(data.token);

        setRole(data.role);

        // SAVE LOCAL STORAGE
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "role",
          data.role
        );

        localStorage.setItem(
          "username",
          username
        );

      } else {

        alert(
          data.error || "Login failed"
        );
      }

    } catch (error) {

      console.error(error);

      alert(
        "Server connection failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div style={styles.loginContainer}>

      <div style={styles.loginBox}>

        <h2 style={styles.loginTitle}>
          LMS Portal
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Secure Learning Management System
        </p>

        {/* USERNAME / EMAIL */}
        <input
          style={styles.input}

          placeholder="Username or Email"

          value={username}

          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        {/* PASSWORD */}
        <input
          style={styles.input}

          type="password"

          placeholder="Password"

          value={password}

          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {/* LOGIN BUTTON */}
        <button
          style={{
            ...styles.button,
            width: "100%",
            marginTop: "10px",
          }}

          onClick={handleLogin}

          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

      </div>

    </div>
  );
}

export default Login;