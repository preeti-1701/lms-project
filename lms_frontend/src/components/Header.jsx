import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./header.css";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!token);
    setUserRole(role || "");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole("");
    setDropdownOpen(false);
    navigate(`/${userRole}/login`);
  };

  const handleLinkClick = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          LMS
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/courses" className="nav-link">
            Courses
          </Link>

          {!isLoggedIn ? (
            <div className="dropdown" ref={dropdownRef}>
              <button className="dropdown-button" onClick={toggleDropdown}>
                Login
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <Link to="/student/login" className="dropdown-item" onClick={handleLinkClick}>
                    Student Login
                  </Link>
                  <Link to="/trainer/login" className="dropdown-item" onClick={handleLinkClick}>
                    Trainer Login
                  </Link>
                  <Link to="/admin/login" className="dropdown-item" onClick={handleLinkClick}>
                    Admin Login
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="dropdown" ref={dropdownRef}>
              <button className="dropdown-button" onClick={toggleDropdown}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <Link to={`/${userRole}/dashboard`} className="dropdown-item" onClick={handleLinkClick}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
