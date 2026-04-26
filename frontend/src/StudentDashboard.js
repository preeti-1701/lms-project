import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function StudentDashboard() {

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);

  const [collapsed, setCollapsed] = useState(false);

  const currentUser = JSON.parse(
    localStorage.getItem('user')
  );


  // logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };


  // fetch courses
  const fetchCourses = async () => {

    try {
      const response = await api.get(
        '/api/student-courses/'
      );
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }

  };

  // learning summary state
  const [summary, setSummary] = useState({
    courses: 0,
    completed: 0,
    total_videos: 0,
    progress: 0
  });

  const fetchSummary = async () => {
    const res = await api.get(
      '/api/student-stats/'
    );

    setSummary(
      res.data
    );

  };




  useEffect(() => {
    fetchCourses();
    fetchSummary();
  }, []);


  // mark complete
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

      fetchCourses();

    } catch (error) {
      console.error(error);
    }

  };



  // youtube embed
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
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>


      {/* SIDEBAR */}
      <div style={{
        width: collapsed ? '50px' : '220px',
        transition: '0.4s',
        background: '#1c3a65',
        color: 'white',
        padding: '30px'
      }}>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '20px'
        }}>

          <button onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer'
            }}
          >
            {/* ☰ */}
            {collapsed ? '»' : '«'}
          </button>
        </div>


        <h4> Student Portal </h4>

        <hr />

        <button style={sideBtn}> {collapsed ? '🏠' : 'Dashboard'}</button>
        <button style={sideBtn}> {collapsed ? '📚' : 'My Courses'}</button>
        <button style={sideBtn}> {collapsed ? '📈' : 'Progress'} </button>
        <button style={sideBtn}> {collapsed ? '👤' : 'Profile'} </button>
        <button onClick={handleLogout} style={{ ...sideBtn, background: '#dc2626' }}> {collapsed ? '🚪' : 'Logout'} </button>

      </div>




      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        padding: '30px',
        background: '#f5f7fb'
      }}>


        {/* Profile header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>

          <h2>My Courses </h2>


          <div style={{
            background: 'white',
            padding: '10px 15px',
            borderRadius: '30px',
            boxShadow: '0 4px 10px rgba(8, 8, 8, 0.08)'
          }}>

            <b> {currentUser?.username} </b>

            <p> Student </p>

          </div>

        </div>



        {/* Learning summary */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow:
            '0 4px 10px rgba(0,0,0,.08)'
        }}>

          <h3> Learning Summary </h3>
{/* 
          <p>Courses Enrolled: {courses.length}</p>

          <p>Track your course progress below. </p> */}

          <p>Courses: {summary.courses} </p>

          <p>Completed Videos: {summary.completed}/{summary.total_videos} </p>

          <p>Overall Progress: {summary.progress}% </p>

        </div>




        {courses.length === 0 && (
          <p> No courses assigned </p>
        )}



        {courses.map((c, index) => (

          <div
            key={index}
            style={{
              marginBottom: '40px',
              padding: '25px',
              border: '1px solid #ddd',
              borderRadius: '14px',
              background: 'white'
            }}
          >

            <h3> {c.course} </h3>

            <p> <b>Category:</b> {c.category} </p>
            <p> <b>Level:</b> {c.level} </p>
            <p> <b>Duration:</b> {c.duration} Hours</p>
            <p> {c.description} </p>

            <h4> Progress: {c.progress}% </h4>


            <div style={{
              width: '100%',
              height: '10px',
              background: '#ddd',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>

              <div style={{
                width: `${c.progress}%`,
                height: '10px',
                background: 'green',
                borderRadius: '10px',
                transition: '0.5s'
              }}>
              </div>

            </div>


            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px'
            }}>


              {c.videos && c.videos.length > 0 ? (

                c.videos.map((v, i) => (

                  <div
                    key={i}
                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      padding: '12px',
                      background: 'white',
                      boxShadow:
                        '0 2px 5px rgba(0,0,0,.1)'
                    }}
                  >

                    <h4> {v.title} </h4>

                    <p style={{ color: 'gray', fontSize: '14px' }}> {v.description} </p>


                    <div style={{ position: 'relative' }}>

                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: '10',
                        background:
                          'rgba(0,0,0,.55)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {currentUser?.username}
                      </div>

                      <iframe
                        width='100%'
                        height='230'
                        src={getEmbedUrl(v.link)}
                        title={v.title}
                        frameBorder='0'
                        allow='encrypted-media'
                        allowFullScreen
                      ></iframe>

                    </div>

                    <p style={{
                      marginTop: '10px',
                      fontWeight: 'bold'
                    }}>
                      {
                        v.completed
                          ? '✅ Completed'
                          : '⏳ Not Completed'
                      }
                    </p>



                    {!v.completed && (

                      <button
                        onClick={() =>
                          markComplete(v.id)
                        }
                        style={{
                          padding: '10px',
                          background: 'green',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px'
                        }}
                      >
                        Mark Completed
                      </button>

                    )}


                  </div>

                ))

              ) : (

                <p> No videos available </p>

              )}

            </div>

          </div>

        ))}


      </div>

    </div>

  );

}



const sideBtn = {
  display: 'block',
  width: '100%',
  marginTop: '15px',
  padding: '12px',
  background: '#1e293b',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};


export default StudentDashboard;