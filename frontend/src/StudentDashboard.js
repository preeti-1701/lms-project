import React, { useEffect, useState } from 'react';
import api from './api';

function StudentDashboard() {

  const [courses, setCourses] = useState([]);

  const currentUser = JSON.parse(
    localStorage.getItem('user')
  );


  // Load courses
  const fetchCourses = async () => {

    try {

      const response = await api.get(
        '/api/student-courses/'
      );

      console.log(
        "API RESPONSE:",
        response.data
      );

      setCourses(response.data);

    } catch (error) {
      console.error(
        "Error fetching courses:",
        error
      );
    }

  };


  useEffect(() => {
    fetchCourses();
  }, []);



  // Mark video completed
  const markComplete = async (videoId) => {

    try {

      await api.post(
        '/api/mark-complete/',
        {
          video_id: videoId
        }
      );

      alert(
        "Video marked completed"
      );

      fetchCourses(); // refresh progress

    } catch (error) {
      console.error(error);
    }

  };



  // YouTube embed conversion
  const getEmbedUrl = (url) => {

    if (!url) return "";

    let videoId = "";

    if (url.includes("youtu.be")) {
      videoId = url.split("/").pop();
    }

    else if (url.includes("watch?v=")) {
      videoId = url
        .split("v=")[1]
        .split("&")[0];
    }

    if (!videoId) {
      return url;
    }


    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&disablekb=1&controls=1`;

  };



  return (

    <div style={{
      padding: "20px",
      fontFamily: "Arial"
    }}>

      <h2>
        My Courses
      </h2>


      {courses.length === 0 && (
        <p>
          No courses assigned
        </p>
      )}



      {courses.map((c, index) => (

        <div
          key={index}
          style={{
            marginBottom: "40px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            background: "#f9f9f9"
          }}
        >

          <h3>
            {c.course}
          </h3>


          {/* Course metadata */}
          <p>
            <b>Category:</b> {c.category}
          </p>

          <p>
            <b>Level:</b> {c.level}
          </p>

          <p>
            <b>Duration:</b> {c.duration}
          </p>

          <p>
            {c.description}
          </p>



          {/* Progress */}
          <h4>
            Progress: {c.progress}%
          </h4>


          <div style={{
            width: "100%",
            height: "22px",
            background: "#ddd",
            borderRadius: "10px",
            marginBottom: "20px"
          }}>

            <div style={{
              width: `${c.progress}%`,
              height: "22px",
              background: "green",
              borderRadius: "10px",
              transition: "0.5s"
            }}>
            </div>

          </div>



          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px"
          }}>


            {c.videos && c.videos.length > 0 ? (

              c.videos.map((v, i) => (

                <div
                  key={i}
                  style={{
                    width: "100%",
                    maxWidth: "420px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "10px",
                    background: "white",
                    boxShadow: "0 2px 5px rgba(0,0,0,.1)"
                  }}
                >

                  <h4>
                    {v.title}
                  </h4>

                  <p style={{
                    color: "gray",
                    fontSize: "14px"
                  }}>
                    {v.description}
                  </p>



                  <div style={{
                    position: "relative"
                  }}>

                    {/* dynamic watermark */}
                    <div style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      zIndex: "10",
                      background: "rgba(0,0,0,.55)",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      {currentUser?.username}
                    </div>


                    <iframe
                      width="100%"
                      height="230"
                      src={getEmbedUrl(v.link)}
                      title={v.title}
                      frameBorder="0"
                      allow="encrypted-media"
                      allowFullScreen
                    ></iframe>

                  </div>



                  {/* completion status */}
                  <p style={{
                    marginTop: "10px",
                    fontWeight: "bold"
                  }}>
                    {v.completed
                      ? "✅ Completed"
                      : "⏳ Not Completed"}
                  </p>


                  {!v.completed && (

                    <button
                      onClick={() => markComplete(v.id)}
                      style={{
                        padding: "10px",
                        background: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Mark Completed
                    </button>

                  )}

                </div>

              ))

            ) : (
              <p>No videos available</p>
            )}

          </div>

        </div>

      ))}

    </div>

  );

}

export default StudentDashboard;