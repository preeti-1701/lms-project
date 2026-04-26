import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';



function TrainerDashboard() {

  // ==========================Navigation==========================
  const navigate = useNavigate();

  // ==========================Naviagation State==========================
  const [collapsed, setCollapsed] = useState(false);

  // =========================Logout==========================
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // =========================Stats State==========================
  const [stats, setStats] = useState({
    courses: 0,
    videos: 0,
    students: 0
  });

  useEffect(() => {
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

    fetchStats();

  }, []);





  // ==========================UI==========================
  return (

    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Arial'
      }}
    >

      {/* ======================Sidebar====================== */}
      <div
        style={{
          width: collapsed ? '50px' : '220px',
          transition: '0.4s',
          background: '#1c3a65',
          color: 'white',
          padding: '30px'
        }}
      >

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '20px'
        }}>

          <button
            onClick={() => setCollapsed(!collapsed)}
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


        <h2>Trainer Portal</h2>
        <hr />

        <button onClick={() => navigate('/create-course')} style={btnStyle}> {collapsed ? '📚' : 'Create Course'} </button>
        <button onClick={() => navigate('/add-video')} style={btnStyle}> {collapsed ? '🎥' : 'Add Videos'} </button>
        <button onClick={() => navigate('/my-courses')} style={btnStyle}> {collapsed ? '📖' : 'My Courses'} </button>
        <button onClick={() => navigate('/my-students')} style={btnStyle}> {collapsed ? '👨‍🎓' : 'My Students'} </button>
        <button onClick={handleLogout} style={{ ...btnStyle, background: '#dc2626' }}> {collapsed ? '🚪' : 'Logout'} </button>

      </div>



      {/* ======================Main Content====================== */}
      <div
        style={{
          flex: 1,
          padding: '40px',
          background: '#f5f7fb'
        }}
      >

        <h1>Welcome Trainer </h1>

        <p>Manage courses, content and students</p>

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',
            gap: '20px',
            marginTop: '30px'
          }}
        >

          <Card title="Courses" value={stats.courses} />
          <Card title="Students" value={stats.students} />
          <Card title="Videos" value={stats.videos} />
          {/* <Card title="Assignments" value={stats.assignments} /> */}

        </div>



        {/* Quick Actions */}
        <div style={{ marginTop: '50px' }}>

          <h2>Quick Actions</h2>

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap'
            }}
          >

            <ActionCard
              label="Create New Course"
              click={() =>
                navigate('/create-course')
              }
            />


            <ActionCard
              label="Upload Videos"
              click={() =>
                navigate('/add-video')
              }
            />


            <ActionCard
              label="Manage Students"
              click={() =>
                navigate('/my-students')
              }
            />

          </div>

        </div>

      </div>

    </div>

  );

}



/* ==========================Shared Button Style========================== */
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



/* =========================Stats Card========================== */
function Card({
  title,
  value
}) {

  return (

    <div
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '18px',
        boxShadow:
          '0 4px 12px rgba(0,0,0,.08)'
      }}
    >

      <h3>{title}</h3>
      <h1>{value}</h1>

    </div>

  );

}



/* ==========================Quick Action Card========================== */
function ActionCard({
  label,
  click
}) {

  return (

    <div
      style={{
        background: 'white',
        padding: '30px',
        width: '240px',
        borderRadius: '18px',
        boxShadow:
          '0 4px 12px rgba(0,0,0,.08)'
      }}
    >

      <h3>{label}</h3>

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