import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import aboutImage from "../components/about.png";

const Home = () => {
  return (
    <div className="home" style={{ backgroundImage: `url(${aboutImage})` }}>
      <div className="hero-content">
        <h1>Welcome to LMS</h1>
        <p className="hero-quote">"Learn Anything, Anywhere, Anytime"</p>
        <Link to="/courses" className="cta-button">
          Explore Courses
        </Link>
      </div>
    </div>
  );
};

export default Home;
