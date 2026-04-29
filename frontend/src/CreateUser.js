
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function CreateUser() {

  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({type: '', text: ''});
  const [users, setUsers] = useState([]);




  /* ---------------------------Fetch Users --------------------------- */
  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users/');

      setUsers(
        res.data
      );

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchUsers();
  }, []);



  /* --------------------------- Back --------------------------- */
  const handleBack = () => {

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/admin');

  };



  /* --------------------------- Create User --------------------------- */
  const handleCreate = async (e) => {

    e.preventDefault();

    if (
      !username.trim() ||
      !password ||
      !role
    ) {
      setFeedback({
        type: 'error',
        text:
          'Please fill all required fields.'
      });
      return;
    }

    setIsSubmitting(true);

    try {

      const response =
        await api.post(
          '/api/create-user/',
          {
            first_name: firstName,
            last_name: lastName,
            username,
            password,
            role
          }
        );

      setFeedback({
        type: 'success',
        text:
          response?.data?.message ||
          'User created successfully'
      });

      setFirstName('');
      setLastName('');
      setUsername('');
      setPassword('');
      setRole('student');

      fetchUsers();

    } catch (error) {

      setFeedback({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Error creating user'
      });

    }

    finally {
      setIsSubmitting(false);
    }

  };



  /* --------------------------- Disable User--------------------------- */
  const handleDisableUser =
    async (id) => {

      try {

        await api.post(
          `/api/disable-user/${id}/`
        );

        alert(
          'User disabled'
        );

        fetchUsers();

      } catch (error) {
        console.error(error);
      }

    };



  /* --------------------------- Enable User --------------------------- */
  const handleEnableUser =
    async (id) => {
      try {
        await api.post(
          `/api/enable-user/${id}/`
        );

        alert(
          'User enabled'
        );

        fetchUsers();

      } catch (error) {
        console.error(error);
      }

    };



  /* ---------------------------
  Force Logout
  --------------------------- */
  const handleForceLogout =
    async (id) => {

      try {

        const res =
          await api.post(
            '/api/force-logout/',
            {
              user_id: id
            }
          );

        alert(
          res.data.message
        );

        fetchUsers();

      } catch (error) {
        console.error(error);
      }

    };



  /* ---------------------------
  Edit User
  --------------------------- */
  const handleEditUser =
    async (id) => {

      const first =
        prompt(
          'Enter new first name'
        );

      const last =
        prompt(
          'Enter new last name'
        );

      if (!first || !last) {
        return;
      }

      try {

        await api.post(
          '/api/edit-user/',
          {
            user_id: id,
            first_name: first,
            last_name: last
          }
        );

        alert(
          'User updated'
        );

        fetchUsers();

      } catch (error) {
        console.error(error);
      }

    };



  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-8 py-12">
        {/* Back button */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        <div className="mx-auto max-w-2xl mb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 border border-cyan-400/30 rounded-full text-xs uppercase font-semibold text-cyan-300">
                User Management
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Create New User
              </span>
            </h1>
            <p className="text-slate-400">
              Add and manage platform users across all roles.
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleCreate}
            className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6 hover:border-cyan-400/20 transition-all duration-300"
          >
            {/* First Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                First Name
              </label>
              <input
                placeholder="Enter first name..."
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Last Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Name
              </label>
              <input
                placeholder="Enter last name..."
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                placeholder="Enter username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              />
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role <span className="text-red-400">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-400/50 focus:outline-none transition-all duration-300"
              >
                <option value="student">Student</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Feedback Message */}
            {feedback.text && (
              <div
                className={`px-4 py-3 rounded-xl border ${
                  feedback.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* User Management Section */}
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Manage Users
            </span>
          </h2>

          <div className="grid gap-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">No users yet. Create one above.</p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="group bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:border-cyan-400/30 hover:bg-slate-900/60 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* User Info */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {u.first_name} {u.last_name}
                      </h3>
                      <p className="text-slate-400 text-sm mb-3">
                        @{u.username}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Role: </span>
                          <span className="text-cyan-300 font-semibold capitalize">
                            {u.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Status: </span>
                          <span
                            className={
                              u.is_active
                                ? 'text-green-300 font-semibold'
                                : 'text-red-300 font-semibold'
                            }
                          >
                            {u.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleEditUser(u.id)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 text-sm"
                      >
                        Edit
                      </button>

                      {u.is_active ? (
                        <button
                          onClick={() => handleDisableUser(u.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnableUser(u.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                        >
                          Enable
                        </button>
                      )}

                      {u.has_active_session && (
                        <button
                          onClick={() => handleForceLogout(u.id)}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                        >
                          Force Logout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default CreateUser;