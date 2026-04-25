import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function Login({ setUser }) {

  // ==========================Navigation==========================
  const navigate = useNavigate();

  // ==========================State==========================
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');



  // =========================Login Handler==========================
  const handleLogin = async () => {

    // Validation
    if (!username || !password) {
      alert(
        "Please enter username and password"
      );
      return;
    }


    try {

      const response = await api.post(
        '/api/login/',
        {
          username,
          password
        }
      );


      // ==========================Store Tokens==========================
      localStorage.setItem(
        'access_token',
        response.data.access
      );

      localStorage.setItem(
        'session_token',
        response.data.session_token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(
          response.data
        )
      );


      // Update App State
      setUser(
        response.data
      );


      alert(
        "Login successful: " +
        response.data.role
      );



      // ==========================Role Based Redirect==========================
      if (response.data.role === 'admin') {
        navigate('/admin');
      }

      else if (response.data.role === 'trainer') {
        navigate('/create-course');
      }

      else if (response.data.role === 'student') {
        navigate('/student');
      }

    } catch (error) {
      console.error(
        error.response
      );

      alert(
        "Invalid login"
      );

    }

  };



  // ==========================UI==========================
  return (

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f7fb'
      }}
    >

      <div
        style={{
          background: 'white',
          padding: '40px',
          width: '400px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,.1)'
        }}
      >

        <h2
          style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >
          LMS Login
        </h2>



        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px'
          }}
        />


        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px'
          }}
        />


        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>


        <p
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: 'gray'
          }}
        >
          Secure Learning Management System
        </p>

      </div>

    </div>

  );

}

export default Login;