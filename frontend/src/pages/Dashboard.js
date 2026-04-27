import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import InstructorDashboard from './InstructorDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'instructor') {
    return <InstructorDashboard />;
  } else {
    return <StudentDashboard />;
  }
};

export default Dashboard;
