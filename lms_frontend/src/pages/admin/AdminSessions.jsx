import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await API.get("/admin/sessions/");
      setSessions(response.data.sessions || []);
    } catch (err) {
      setError("Failed to fetch sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const forceLogout = async (sessionId, userEmail) => {
    if (window.confirm(`Are you sure you want to logout ${userEmail}?`)) {
      try {
        await API.post(`/admin/sessions/${sessionId}/logout/`);
        setSessions(sessions.filter(session => session.id !== sessionId));
        alert(`User ${userEmail} has been logged out successfully`);
      } catch (err) {
        setError("Failed to logout user");
        console.error("Error logging out user:", err);
      }
    }
  };

  const getRoleColor = (role) => {
    if (role === "admin") return "#dc3545";
    if (role === "trainer") return "#ffc107";
    return "#28a745";
  };

  const truncateDevice = (device) => {
    if (!device) return "N/A";
    return device.length > 50 ? device.substring(0, 50) + "..." : device;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>User Sessions Management</h2>
      <p style={{ color: "#666", marginBottom: "16px" }}>Total active sessions: <strong>{sessions.length}</strong></p>

      {sessions.length === 0 ? (
        <p>No active sessions found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Role</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>IP Address</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Device</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{session.id}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{session.user__name || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{session.user__email}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span style={{ textTransform: "capitalize", fontWeight: "bold", color: getRoleColor(session.user__role) }}>
                      {session.user__role || "N/A"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{session.ip_address || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span title={session.device} style={{ fontSize: "12px" }}>
                      {truncateDevice(session.device)}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <button
                      onClick={() => forceLogout(session.id, session.user__email)}
                      style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Force Logout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSessions;
