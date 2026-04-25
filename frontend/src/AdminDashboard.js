import React from 'react';
import { useNavigate } from 'react-router-dom';



function AdminDashboard() {

    // Navigation
    const navigate = useNavigate();

    // Logout
    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };


    // UI
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
                    width: '260px',
                    background: '#1f2937',
                    color: 'white',
                    padding: '30px'
                }}
            >

                <h2>Admin Portal</h2>
                <hr />

                <button onClick={() => navigate('/create-user')} style={btnStyle}> Create User </button>
                <button onClick={() => navigate('/create-course')} style={btnStyle}> Create Course </button>
                <button onClick={() => navigate('/add-video')}style={btnStyle}> Add Videos </button>
                <button onClick={() => navigate('/enroll')}style={btnStyle}> Enroll Students </button>
                <button onClick={() => navigate('/sessions')}style={btnStyle}> Active Sessions </button>
                <button onClick={handleLogout}style={{...btnStyle, background: '#dc2626'}}> Logout </button>

            </div>


            {/* ======================Main Content====================== */}
            <div
                style={{
                    flex: 1,
                    padding: '40px',
                    background: '#f5f7fb'
                }}
            >

                <h1> Welcome Admin </h1>

                <p> Manage your LMS platform </p>

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

                    <Card title="Users" value="8+"/>
                    <Card title="Courses" value="5+"/>
                    <Card title="Enrollments" value="12+"/>
                    <Card title="Sessions" value="Live"/>

                </div>



                {/* Quick Actions */}
                <div style={{marginTop: '50px'}}>

                    <h2>Quick Actions</h2>

                    <div
                        style={{
                            display: 'flex',
                            gap: '20px',
                            flexWrap: 'wrap'
                        }}
                    >

                        <ActionCard
                            label="Create New User"
                            click={() =>
                                navigate('/create-user')
                            }
                        />

                        <ActionCard
                            label="Create Course"
                            click={() =>
                                navigate('/create-course')
                            }
                        />

                        <ActionCard
                            label="Enroll Student"
                            click={() =>
                                navigate('/enroll')
                            }
                        />

                    </div>

                </div>

            </div>

        </div>

    );

}



/* ==========================
   Shared Button Style
========================== */
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



/* ==========================
   Stats Card Component
========================== */
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

            <h3>
                {title}
            </h3>

            <h1>
                {value}
            </h1>

        </div>

    );

}



/* ==========================
   Action Card Component
========================== */
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


export default AdminDashboard;