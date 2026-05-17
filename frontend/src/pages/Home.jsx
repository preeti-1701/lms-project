import {Link} from "react-router-dom";
import heroImg from "../assets/hero.png";

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "#0b0146",
        minHeight: "100vh",
        color: "white",
        padding: "50px",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left Side */}
        <div style={{ width: "50%" }}>
          <h1
            style={{
              fontSize: "55px",
              lineHeight: "70px",
            }}
          >
            LEARNING MANAGEMENT SYSTEM
          </h1>

          <p
            style={{
              fontSize: "22px",
              marginTop: "20px",
              color: "#d1d5db",
              lineHeight: "35px",
            }}
          >
            "Online learning is not the next big thing,
            it is the now big thing"
          </p>

          <div style={{ marginTop: "40px" }}>
          <Link to ="/login">
            <button
              style={{
                padding: "15px 40px",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "10px",
                marginRight: "20px",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
            </Link>

            
            <Link to ="/register">
            <button
              style={{
                padding: "15px 40px",
                backgroundColor: "transparent",
                color: "white",
                border: "2px solid #8b5cf6",
                borderRadius: "10px",
                fontSize: "20px",
                cursor: "pointer"
              }}
            >
              Register
            </button>
            </Link>
          </div>
        </div>

        {/* Right Side */}
        <div style={{ width: "45%" }}>
          <img
            src={heroImg}
            alt="LMS"
            style={{
              width: "100%",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
