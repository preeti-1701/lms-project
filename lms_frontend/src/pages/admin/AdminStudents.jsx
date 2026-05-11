import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await API.get("/admin/students/");
      setStudents(response.data.students);
    } catch (err) {
      setError("Failed to fetch students");
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, is_active: !currentStatus }
          : student
      ));
    } catch (err) {
      setError("Failed to update student status");
      console.error("Error updating student status:", err);
    }
  };

  const forceLogoutStudent = async (studentId, studentEmail) => {
    if (window.confirm(`Are you sure you want to force logout ${studentEmail}?`)) {
      try {
        const response = await API.get("/admin/sessions/");
        const studentSessions = response.data.sessions.filter(
          session => session.user__id === studentId
        );
        
        for (const session of studentSessions) {
          await API.post(`/admin/sessions/${session.id}/logout/`);
        }
        
        alert(`Student ${studentEmail} has been logged out successfully`);
      } catch (err) {
        setError("Failed to logout student");
        console.error("Error logging out student:", err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Manage Students</h2>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>ID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Email</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {student.name || "N/A"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <span 
                    style={{ 
                      color: student.is_active ? "green" : "red",
                      fontWeight: "bold"
                    }}
                  >
                    {student.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button 
                      onClick={() => toggleStudentStatus(student.id, student.is_active)}
                      style={{ 
                        backgroundColor: student.is_active ? "#ffc107" : "#28a745",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}
                    >
                      {student.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button 
                      onClick={() => forceLogoutStudent(student.id, student.email)}
                      style={{ 
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}
                    >
                      Force Logout
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminStudents;
