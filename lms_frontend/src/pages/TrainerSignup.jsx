import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./TrainerSignup.css";

const TrainerSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }
    const mobileWithCode = "+91" + formData.mobile;
    try {
      const res = await API.post("/trainer/register/", {
        ...formData,
        mobile: mobileWithCode
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", formData.email);
      localStorage.setItem("role", "trainer");
      navigate("/trainer/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Trainer Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mobile:</label>
            <div style={{ display: "flex", gap: "5px" }}>
              <span style={{ padding: "0.5rem", background: "#f0f0f0", border: "1px solid #ddd", borderRadius: "4px" }}>+91</span>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10 digit number"
                maxLength="10"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">Sign Up</button>
        </form>
        <p className="signup-link">
          Already have an account? <a href="/trainer/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default TrainerSignup;
