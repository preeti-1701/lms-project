import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await API.get("/admin/trainers/");
      setTrainers(response.data.trainers);
    } catch (err) {
      setError("Failed to fetch trainers");
      console.error("Error fetching trainers:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrainerStatus = async (trainerId, currentStatus) => {
    try {
      setTrainers(trainers.map(trainer => 
        trainer.id === trainerId 
          ? { ...trainer, is_active: !currentStatus }
          : trainer
      ));
    } catch (err) {
      setError("Failed to update trainer status");
      console.error("Error updating trainer status:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Manage Trainers</h2>

      {trainers.length === 0 ? (
        <p>No trainers found.</p>
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
            {trainers.map((trainer) => (
              <tr key={trainer.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trainer.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {trainer.name || "N/A"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{trainer.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <span 
                    style={{ 
                      color: trainer.is_active ? "green" : "red",
                      fontWeight: "bold"
                    }}
                  >
                    {trainer.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button 
                    onClick={() => toggleTrainerStatus(trainer.id, trainer.is_active)}
                    style={{ 
                      backgroundColor: trainer.is_active ? "#ffc107" : "#28a745",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    {trainer.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminTrainers;
