import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", mobile: "" });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await API.get("/admin/trainers/");
      setTrainers(response.data.trainers || []);
    } catch (err) {
      setError("Failed to fetch trainers");
      console.error("Error fetching trainers:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (trainerId) => {
    try {
      const response = await API.post(`/admin/user/${trainerId}/toggle-status/`);
      alert(response.data.message);
      fetchTrainers();
    } catch (err) {
      alert("Failed to toggle status");
      console.error("Error toggling status:", err);
    }
  };

  const startEdit = (trainer) => {
    setEditingTrainer(trainer.id);
    setEditForm({ name: trainer.name, email: trainer.email, mobile: trainer.mobile });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/admin/user/${editingTrainer}/update/`, editForm);
      alert("Trainer updated successfully");
      setEditingTrainer(null);
      fetchTrainers();
    } catch (err) {
      alert("Failed to update trainer");
      console.error("Error updating trainer:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Manage Trainers</h2>
      <p style={{ color: "#666", marginBottom: "16px" }}>Total trainers: <strong>{trainers.length}</strong></p>

      {editingTrainer && (
        <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #ddd" }}>
          <h3>Edit Trainer</h3>
          <form onSubmit={handleUpdate} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <input type="text" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} placeholder="Mobile" style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            <button type="submit" style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Save</button>
            <button type="button" onClick={() => setEditingTrainer(null)} style={{ backgroundColor: "#6c757d", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
          </form>
        </div>
      )}

      {trainers.length === 0 ? (
        <p>No trainers found.</p>
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
              {trainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trainer.id}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trainer.name || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trainer.email}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trainer.mobile || "N/A"}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <span style={{ color: trainer.is_active ? "green" : "red", fontWeight: "bold" }}>
                      {trainer.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => startEdit(trainer)} style={{ backgroundColor: "#ffc107", color: "black", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                      <button onClick={() => toggleStatus(trainer.id)} style={{ backgroundColor: trainer.is_active ? "#6c757d" : "#28a745", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "12px" }}>{trainer.is_active ? "Disable" : "Enable"}</button>
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

export default AdminTrainers;
