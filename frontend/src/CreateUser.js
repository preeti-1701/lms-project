import React, { useState } from 'react';
import api from './api';


function CreateUser() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleCreate = async () => {
    // ✅ validation
    if (!username || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await api.post('/api/create-user/', {
        first_name: firstName,
        last_name: lastName,
        username,
        password,
        role
      });

      alert(response.data.message);

      // 🔄 reset form
      setUsername('');
      setPassword('');
      setRole('student');

    } catch (error) {
      console.error(error.response);
      alert("Error creating user");
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

      <h2 style={{ textAlign: "center" }}>Create User</h2>

      <input
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="trainer">Trainer</option>
        <option value="admin">Admin</option>
      </select>


      <button
        onClick={handleCreate}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#17a2b8",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Create
      </button>
    </div>
  );
}

export default CreateUser;