import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await API.get("/admin/students/");
      setStudents(response.data.students || []);
    } catch (err) {
      setError("Failed to fetch students");
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (studentId) => {
    try {
      const response = await API.post(`/admin/user/${studentId}/toggle-status/`);
      alert(response.data.message);
      fetchStudents();
    } catch (err) {
      alert("Failed to toggle status");
      console.error("Error toggling status:", err);
    }
  };

  const startEdit = (student) => {
    setEditingStudent(student.id);
    setEditForm({ name: student.name, email: student.email, mobile: student.mobile });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/admin/user/${editingStudent}/update/`, editForm);
      alert("Student updated successfully");
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      alert("Failed to update student");
      console.error("Error updating student:", err);
    }
  };

  const forceLogoutStudent = async (studentId, studentEmail) => {
    if (window.confirm(`Are you sure you want to force logout ${studentEmail}?`)) {
      try {
        const response = await API.get("/admin/sessions/");
        const studentSessions = (response.data.sessions || []).filter(
          session => session.user__id === studentId
        );
        if (studentSessions.length === 0) {
          alert(`${studentEmail} has no active sessions.`);
          return;
        }
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
      <p style={{ color: "#666", marginBottom: "16px" }}>Total students: <strong>{students.length}</strong></p>

      {editingStudent && (
        <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #ddd" }}>
          <h3>Edit Student</h3>
          <form onSubmit={handleUpdate} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="text" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} placeholder="Mobile" style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <button type="submit" style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Save</button>
            <button type="button" onClick={() => setEditingStudent(null)} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>ID</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Name</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Mobile</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.id}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.name || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.email}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{student.mobile || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span style={{ color: student.is_active ? "green" : "red", fontWeight: "bold" }}>
                      {student.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => startEdit(student)} style={{ backgroundColor: "#ffc107", color: "black", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                      <button onClick={() => toggleStatus(student.id)} style={{ backgroundColor: student.is_active ? "#6c757d" : "#28a745", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>{student.is_active ? "Disable" : "Enable"}</button>
                      <button onClick={() => forceLogoutStudent(student.id, student.email)} style={{ backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>Logout</button>
                    </div>
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

export default AdminStudents;
