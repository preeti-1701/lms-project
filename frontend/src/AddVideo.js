// import React, { useState } from 'react';
// import axios from 'axios';

// function AddVideo() {
//   const [courseId, setCourseId] = useState('');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [youtubeLink, setYoutubeLink] = useState('');

//   const handleAdd = async () => {
//     const token = localStorage.getItem('access_token');

//     try {
//       const response = await axios.post(
//         'http://127.0.0.1:8000/api/add-video/',
//         {
//           course_id: courseId,
//           title: title,
//           description: description,
//           youtube_link: youtubeLink
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       alert(response.data.message);
//     } catch (error) {
//       console.log(error.response);
//       alert("Error adding video");
//     }
//   };

//   return (
//     <div>
//       <h2>Add Video (YouTube)</h2>

//       <input placeholder="Course ID" onChange={(e) => setCourseId(e.target.value)} />
//       <input placeholder="Video Title" onChange={(e) => setTitle(e.target.value)} />
//       <textarea placeholder="Video Description" value={description} onChange={(e) => setDescription(e.target.value)}/>
//       <input placeholder="YouTube Link" onChange={(e) => setYoutubeLink(e.target.value)} />

//       <button onClick={handleAdd}>Add Video</button>
//     </div>
//   );
// }

// export default AddVideo;

import React, { useState, useEffect } from 'react';
import api from './api';

function AddVideo() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  // 🔹 Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/courses/');   // ✅ correct
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  // 🔹 Add video
  const handleAddVideo = async () => {
    // ✅ Basic validation
    if (!courseId || !title || !youtubeLink) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await api.post('/api/add-video/', {
        course_id: courseId,
        title,
        description,
        youtube_link: youtubeLink
      });

      alert("Video added successfully");

      // 🔄 Reset form
      setCourseId('');
      setTitle('');
      setDescription('');
      setYoutubeLink('');

    } catch (error) {
      console.error(error.response);
      alert("Error adding video");
    }
  };

  return (
    <div tyle={{
      padding: "20px",
      maxWidth: "500px",
      margin: "auto",
      border: "1px solid #ddd",
      borderRadius: "10px",
      backgroundColor: "#f9f9f9"
    }}>
      <h2 style={{ textAlign: "center" }}>Add Video</h2>

      {/* 🔹 Course Dropdown */}
      {/* <select value={courseId} onChange={(e) => setCourseId(e.target.value)}> */}
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

      {/* 🔹 Title */}
      <input
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 🔹 Description */}
      <textarea
        placeholder="Video Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 🔹 YouTube Link */}
      <input
        placeholder="YouTube Link"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
      />

      <br /><br />

      {/* <button onClick={handleAddVideo}>Add Video</button> */}
      <button
        onClick={handleAddVideo}
        style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
        }}
      >
        Add Video
      </button>
    </div>
  );
}

export default AddVideo;