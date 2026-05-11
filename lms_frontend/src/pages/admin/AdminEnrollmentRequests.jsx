import React, { useState, useEffect } from "react";
import API from "../../utils/api";

const AdminEnrollmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await API.get("/courses/enrollment-requests/");
      setRequests(response.data.enrollments || []);
    } catch (err) {
      setError("Failed to fetch enrollment requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await API.post(`/courses/enrollment/${requestId}/approve/`);
      alert("Enrollment approved");
      fetchRequests();
    } catch (err) {
      setError("Failed to approve enrollment");
      console.error("Error approving:", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await API.post(`/courses/enrollment/${requestId}/reject/`);
      alert("Enrollment rejected");
      fetchRequests();
    } catch (err) {
      setError("Failed to reject enrollment");
      console.error("Error rejecting:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>Enrollment Requests</h2>

      {requests.length === 0 ? (
        <p>No pending enrollment requests.</p>
      ) : (
        <div>
          {requests.map((request) => (
            <div key={request.id} style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0", borderRadius: "8px" }}>
              <h4>{request.student_name}</h4>
              <p>Course: {request.course_title}</p>
              <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleApprove(request.id)}
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEnrollmentRequests;
