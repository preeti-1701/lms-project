import { useEffect, useState } from "react";
import API from "../../utils/api";
import "./EnrollmentRequests.css";

const EnrollmentRequests = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollmentRequests();
  }, []);

  const fetchEnrollmentRequests = async () => {
    try {
      const res = await API.get("/courses/enrollment-requests/");
      setEnrollments(res.data.enrollments || []);
    } catch (err) {
      console.log(err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.post(`/courses/enrollment/${id}/approve/`);
      alert("Enrollment approved");
      fetchEnrollmentRequests();
    } catch (err) {
      console.log(err);
      alert("Failed to approve enrollment");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/courses/enrollment/${id}/reject/`);
      alert("Enrollment rejected");
      fetchEnrollmentRequests();
    } catch (err) {
      console.log(err);
      alert("Failed to reject enrollment");
    }
  };

  if (loading) return <p className="status">Loading enrollment requests...</p>;

  return (
    <div className="enrollment-requests-container">
      <h2>Enrollment Requests</h2>

      {enrollments.length === 0 ? (
        <p>No pending enrollment requests</p>
      ) : (
        <div className="enrollment-list">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="enrollment-item">
              <div className="enrollment-info">
                <h3>{enrollment.course_title}</h3>
                <p><strong>Student:</strong> {enrollment.student_name || enrollment.student_email}</p>
                <p><strong>Email:</strong> {enrollment.student_email}</p>
                <p><strong>Status:</strong> <span className="status-pending">{enrollment.status}</span></p>
              </div>
              <div className="enrollment-actions">
                <button className="approve-button" onClick={() => handleApprove(enrollment.id)}>
                  Approve
                </button>
                <button className="reject-button" onClick={() => handleReject(enrollment.id)}>
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

export default EnrollmentRequests;
