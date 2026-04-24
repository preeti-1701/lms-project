import React, { useState } from 'react';
import api from './api';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // ✅ validation
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      const response = await api.post('/api/login/', {
        username,
        password
      });

      // ✅ Store tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('session_token', response.data.session_token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // ✅ Update state
      setUser(response.data);

      alert("Login successful: " + response.data.role);

    } catch (error) {
      console.error(error.response);
      alert("Invalid login");
    }
  };

  return (
    <div>
      <h2>Login</h2>

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

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;