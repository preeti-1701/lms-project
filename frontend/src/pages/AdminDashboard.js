import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [name, setName] = useState(localStorage.getItem('name') || 'Admin');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [assignData, setAssignData] = useState({ userId: '', courseId: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const usersRes = await api.get('/users/all');
      setUsers(usersRes.data.users);
      const coursesRes = await api.get('/course/all');
      setCourses(coursesRes.data.courses);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/users/create', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      fetchData();
      setMessage('User created successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/course/enroll', assignData);
      setAssignData({ userId: '', courseId: '' });
      setMessage('Course assigned successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to assign course');
    }
  };

  return (
    <div className="page-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="section-title">Admin Dashboard</h1>
        <button className="action-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <p className="small-text">Welcome, {name}. Manage users and assign courses from this dashboard.</p>

      <div className="grid" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>Create User</h2>
          <form onSubmit={handleAddUser} className="grid">
            <input
              className="input-field"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              className="input-field"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <input
              className="input-field"
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <select
              className="select-field"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="student">student</option>
              <option value="trainer">trainer</option>
              <option value="admin">admin</option>
            </select>
            <button className="action-button" type="submit">Create User</button>
          </form>
        </div>

        <div className="card">
          <h2>Assign Course</h2>
          <form onSubmit={handleAssign} className="grid">
            <select
              className="select-field"
              value={assignData.userId}
              onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
            >
              <option value="">Select student</option>
              {users.filter((u) => u.role === 'student').map((user) => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
            <select
              className="select-field"
              value={assignData.courseId}
              onChange={(e) => setAssignData({ ...assignData, courseId: e.target.value })}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <button className="action-button" type="submit">Assign</button>
          </form>
        </div>
      </div>

      {message && <div className="small-text" style={{ marginTop: 12 }}>{message}</div>}

      <div className="grid" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>Users</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id}>{user.name} — {user.email} — {user.role}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>Courses</h2>
          <ul>
            {courses.map((course) => (
              <li key={course.id}>{course.title} (Trainer: {course.trainer_name})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
