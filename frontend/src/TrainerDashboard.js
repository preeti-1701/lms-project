import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function TrainerDashboard() {

  const navigate = useNavigate();

  const [collapsed, setCollapsed] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const [view, setView] =
    useState('dashboard');


  const currentUser =
    JSON.parse(
      localStorage.getItem('user')
    );



  /* ---------------- Logout ---------------- */
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };



  /* ---------------- Stats ---------------- */
  const [stats, setStats] = useState({
    courses: 0,
    videos: 0
  });


  /* ----------- Trainer Catalog ----------- */
  const [trainerCourses,
    setTrainerCourses] = useState([]);



  const fetchStats = async () => {

    try {

      const res = await api.get(
        '/api/trainer-stats/'
      );

      setStats(
        res.data
      );

    } catch (error) {
      console.error(error);
    }

  };



  const fetchTrainerCourses =
    async () => {

      try {

        const res = await api.get(
          '/api/trainer-courses/'
        );

        setTrainerCourses(
          res.data
        );

      } catch (error) {
        console.error(error);
      }

    };



  useEffect(() => {

    fetchStats();
    fetchTrainerCourses();

  }, []);



  return (

    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>



      {/* SIDEBAR */}
      <div style={{
        width:
          collapsed
            ? '70px'
            : '230px',
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

          <button
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '28px',
              cursor: 'pointer'
            }}
          >
            {collapsed ? '»' : '«'}
          </button>

        </div>



        <h3>
          {collapsed
            ? '👨‍🏫'
            : 'Trainer Portal'}
        </h3>

        <hr />


        <button
          onClick={() =>
            setView('dashboard')
          }
          style={btnStyle}
        >
          {collapsed ? '🏠' : 'Dashboard'}
        </button>


        <button
          onClick={() =>
            navigate('/create-course')
          }
          style={btnStyle}
        >
          {collapsed ? '📚' : 'Create Course'}
        </button>



        <button
          onClick={() =>
            navigate('/add-video')
          }
          style={btnStyle}
        >
          {collapsed ? '🎥' : 'Add Videos'}
        </button>



        <button
          onClick={() =>
            setView('catalog')
          }
          style={btnStyle}
        >
          {collapsed ? '📖' : 'My Catalog'}
        </button>



        <button
          onClick={() =>
            setShowProfile(
              !showProfile
            )
          }
          style={btnStyle}
        >
          {collapsed ? '👤' : 'Profile'}
        </button>



        <button
          onClick={handleLogout}
          style={{
            ...btnStyle,
            background: '#dc2626'
          }}
        >
          {collapsed ? '🚪' : 'Logout'}
        </button>


      </div>






      {/* MAIN */}
      <div style={{
        flex: 1,
        padding: '40px',
        background: '#f5f7fb'
      }}>



        {/* TOP HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '35px',
          position: 'relative'
        }}>

          <div>

            <h1>
              Welcome Trainer
            </h1>

            <p>
              Manage courses and learning content
            </p>

          </div>



          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>

            <div style={{
              fontSize: '24px'
            }}>
              🔔
            </div>



            <div
              onClick={() =>
                setShowProfile(
                  !showProfile
                )
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'white',
                padding: '10px 16px',
                borderRadius: '40px',
                cursor: 'pointer',
                boxShadow:
                  '0 4px 12px rgba(0,0,0,.08)'
              }}
            >

              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#0f766e',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {
                  (currentUser?.first_name?.[0]
                    ||
                    currentUser?.username?.[0]
                    ||
                    'T'
                  ).toUpperCase()
                }
              </div>


              <div>

                <div style={{
                  fontWeight: 'bold'
                }}>
                  {currentUser?.username}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: 'gray'
                }}>
                  Trainer
                </div>

              </div>

              ▼

            </div>




            {showProfile && (

              <div style={{
                position: 'absolute',
                top: '70px',
                right: '0',
                width: '320px',
                background: 'white',
                borderRadius: '18px',
                padding: '25px',
                boxShadow:
                  '0 10px 35px rgba(0,0,0,.18)',
                zIndex: 999
              }}>

                <div style={{
                  textAlign: 'center'
                }}>

                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: '#0f766e',
                    margin: '0 auto 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '26px'
                  }}>
                    {
                      (currentUser?.first_name?.[0]
                        ||
                        currentUser?.username?.[0]
                        ||
                        'T'
                      ).toUpperCase()
                    }
                  </div>

                  <h3>
                    {currentUser?.first_name ||
                      currentUser?.username}
                    {' '}
                    {currentUser?.last_name || ''}
                  </h3>

                  <p style={{
                    color: 'gray'
                  }}>
                    Trainer
                  </p>

                </div>

                <hr />

                <p>
                  <b>Username:</b>
                  {' '}
                  {currentUser?.username}
                </p>

                <p>
                  <b>Courses:</b>
                  {' '}
                  {stats.courses}
                </p>

                <p>
                  <b>Videos:</b>
                  {' '}
                  {stats.videos}
                </p>


                <button
                  onClick={handleLogout}
                  style={{
                    marginTop: '18px',
                    width: '100%',
                    padding: '12px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px'
                  }}
                >
                  Logout
                </button>

              </div>

            )}

          </div>

        </div>






        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (

          <>

            <div style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(240px,1fr))',
              gap: '20px'
            }}>

              <Card
                title='Courses'
                value={stats.courses}
              />

              <Card
                title='Videos'
                value={stats.videos}
              />

            </div>




            <div style={{
              marginTop: '50px'
            }}>

              <h2>
                Quick Actions
              </h2>

              <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap'
              }}>

                <ActionCard
                  label='Create New Course'
                  click={() =>
                    navigate('/create-course')
                  }
                />

                <ActionCard
                  label='Upload Videos'
                  click={() =>
                    navigate('/add-video')
                  }
                />

                <ActionCard
                  label='My Catalog'
                  click={() =>
                    setView('catalog')
                  }
                />

              </div>

            </div>

          </>

        )}






        {/* CATALOG VIEW */}
        {view === 'catalog' && (

          <div>

            <h2>
              My Course Catalog
            </h2>

            <p>
              Courses created by you
            </p>


            {trainerCourses.length === 0 && (
              <p>
                No courses created yet.
              </p>
            )}



            <div style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit,minmax(320px,1fr))',
              gap: '25px',
              marginTop: '30px'
            }}>

              {trainerCourses.map(course => (

                <div
                  key={course.id}
                  style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '18px',
                    boxShadow:
                      '0 4px 12px rgba(0,0,0,.08)'
                  }}
                >

                  <h3>
                    <b>Title:</b>
                    {course.title}
                  </h3>

                  <p>
                    <b>Description:</b>
                    {course.description}
                  </p>

                  <p>
                    <b>Category:</b>
                    {course.category}
                  </p>

                  <p>
                    <b>Level:</b>
                    {course.level}
                  </p>

                  <p>
                    <b>Duration:</b>
                    {course.duration}
                  </p>

                  <p>
                    <b>Videos:</b>
                    {course.videos_count}
                  </p>


                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '20px'
                  }}>

                    <button
                      onClick={() =>
                        navigate('/add-video')
                      }
                      style={smallBtn}
                    >
                      Add Video
                    </button>


                    <button
                      style={smallBtn}
                    >
                      Edit
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}



      </div>

    </div>

  );

}




const btnStyle = {
  display: 'block',
  width: '100%',
  marginTop: '15px',
  padding: '12px',
  background: '#374151',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};



const smallBtn = {
  padding: '10px 16px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer'
};



function Card({
  title,
  value
}) {

  return (

    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '18px',
      boxShadow:
        '0 4px 12px rgba(0,0,0,.08)'
    }}>

      <h3>
        {title}
      </h3>

      <h1>
        {value}
      </h1>

    </div>

  );

}




function ActionCard({
  label,
  click
}) {

  return (

    <div style={{
      background: 'white',
      padding: '30px',
      width: '240px',
      borderRadius: '18px',
      boxShadow:
        '0 4px 12px rgba(0,0,0,.08)'
    }}>

      <h3>
        {label}
      </h3>

      <button
        onClick={click}
        style={{
          marginTop: '15px',
          padding: '10px 20px'
        }}
      >
        Open
      </button>

    </div>

  );

}


export default TrainerDashboard;