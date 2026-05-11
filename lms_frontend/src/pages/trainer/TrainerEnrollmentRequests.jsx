import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import "./TrainerEnrollmentRequests.css";

const TrainerEnrollmentRequests = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      {loading ? (
        <p>Loading...</p>
      ) : enrollments.length > 0 ? (
        <div className="enrollment-list">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="enrollment-item">
              <div className="enrollment-info">
                <h3>{enrollment.student_name || enrollment.student_email}</h3>
                <p>Course: {enrollment.course_title}</p>
                <p>Email: {enrollment.student_email}</p>
              </div>
              <div className="enrollment-actions">
                <button
                  className="approve-button"
                  onClick={() => handleApprove(enrollment.id)}
                >
                  Approve
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleReject(enrollment.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No pending enrollment requests</p>
      )}
    </div>
  );
};

export default TrainerEnrollmentRequests;
