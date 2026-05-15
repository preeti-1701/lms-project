import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import setupSecurityDeterrents from './utils/securityDeterrents';

// Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import TrainerLogin from './pages/TrainerLogin';
import TrainerRegister from './pages/TrainerRegister';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseCourses from './pages/BrowseCourses';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import CourseView from './pages/CourseView';
import VideoPlayer from './pages/VideoPlayer';
import AdminUsers from './pages/admin/AdminUsers';
import ManageCourses from './pages/admin/ManageCourses';
import { Notifications } from './pages/Placeholders';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  const { loading } = useAuth();

  useEffect(() => {
    // Setup right-click and shortcut blocks
    const cleanup = setupSecurityDeterrents();
    return cleanup;
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        
        <Route path="/trainer-login" element={<TrainerLogin />} />
        <Route path="/trainer-register" element={<TrainerRegister />} />
        
        {/* Protected Student/General Routes - With Sidebar Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/browse" element={
          <ProtectedRoute>
            <Layout>
              <BrowseCourses />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/my-courses" element={
          <ProtectedRoute>
            <Layout>
              <MyCourses />
            </Layout>
          </ProtectedRoute>
        } />



        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/course/:id" element={
          <ProtectedRoute>
            <Layout>
              <CourseView />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/course/:courseId/video/:videoId" element={
          <ProtectedRoute>
            <VideoPlayer />
          </ProtectedRoute>
        } />

        {/* Admin/Trainer Routes */}
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <Layout>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/courses" element={
          <ProtectedRoute roles={['admin', 'trainer']}>
            <Layout>
              <ManageCourses />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
