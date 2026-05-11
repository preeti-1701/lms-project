import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_trainers: 0,
    total_courses: 0,
    active_users: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/stats/");
      setStats(response.data.stats);
    } catch (err) {
      setError("Failed to fetch dashboard stats");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #ccc", padding: "20px", textAlign: "center", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3>{stats.total_students}</h3>
          <p>Total Students</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "20px", textAlign: "center", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3>{stats.total_trainers}</h3>
          <p>Total Trainers</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "20px", textAlign: "center", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3>{stats.total_courses}</h3>
          <p>Total Courses</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "20px", textAlign: "center", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <h3>{stats.active_users}</h3>
          <p>Active Users</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
