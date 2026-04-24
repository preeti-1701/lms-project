import React, { useState, useEffect } from 'react';
import api from './api';

function EnrollStudent() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          api.get('/api/students/'),
          api.get('/api/courses/')
        ]);

        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async () => {
    if (!studentId || !courseId) {
      alert("Please select student and course");
      return;
    }

    try {
      await api.post('/api/enroll/', {
        student_id: studentId,
        course_id: courseId
      });

      alert("Student enrolled successfully");
      setStudentId('');
      setCourseId('');
    } catch (error) {
      console.error(error.response);
      alert("Error enrolling student");
    }
  };
  const handleForceLogout = async (userId) => {
    try {
      const res = await api.post('/api/force-logout/', {
        user_id: userId
      });

      alert(res.data.message);

    } catch (error) {
      console.error(error.response);
      alert("Error forcing logout");
    }
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "500px",
      margin: "auto",
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#f9f9f9"
    }}>
      <h2 style={{ textAlign: "center" }}>Enroll Student</h2>

      {/* Student Dropdown */}
      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      >
        <option value="">Select Student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.first_name && s.last_name
              ? `${s.first_name} ${s.last_name}`
              : s.username}
          </option>
        ))}
      </select>

      {/* Course Dropdown */}
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
      >
        <option value="">Select Course</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* Button */}
      <button
        onClick={handleEnroll}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Enroll
      </button>

      <hr />

      <h3>Active Users</h3>

      {students.map((s) => (
        <div
          key={s.id}
          style={{
            marginBottom: "10px",
            padding: "10px",
            border: "1px solid #ddd"
          }}
        >
          <b>
            {s.first_name} {s.last_name}
          </b>
          ({s.username})

          <button
            onClick={() => handleForceLogout(s.id)}
            style={{
              marginLeft: "15px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "8px"
            }}
          >
            Force Logout
          </button>
            
        </div>
      ))}
    </div>
  );
}

export default EnrollStudent;