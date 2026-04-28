
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

    <section className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(255,184,77,0.16)_0%,transparent_28%),radial-gradient(circle_at_90%_18%,rgba(13,142,123,0.14)_0%,transparent_30%),linear-gradient(155deg,#f7fbfa_0%,#eef4ff_100%)] px-4 py-8">

      <div className="mx-auto mb-4 flex max-w-6xl justify-between">

        <button
          onClick={handleBack}
          className="rounded-full bg-white px-4 py-2 shadow"
        >
          ← Back
        </button>

      </div>



      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] shadow-xl lg:grid-cols-[0.85fr_1.15fr]">


        {/* LEFT PANEL */}
        <aside className="bg-teal-700 text-white p-10">

          <span className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase">
            LMS Admin
          </span>

          <h1 className="mt-6 text-5xl font-semibold">
            User Management
          </h1>

          <p className="mt-4">
            Create and manage platform users.
          </p>

        </aside>



        {/* CREATE FORM */}
        <form
          onSubmit={handleCreate}
          className="bg-white p-10 space-y-4"
        >

          <h2 className="text-3xl font-semibold">
            Create New User
          </h2>


          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) =>
              setFirstName(
                e.target.value
              )}
            className="w-full rounded-2xl border p-4"
          />

          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) =>
              setLastName(
                e.target.value
              )}
            className="w-full rounded-2xl border p-4"
          />

          <input
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )}
            className="w-full rounded-2xl border p-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )}
            className="w-full rounded-2xl border p-4"
          />


          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target.value
              )}
            className="w-full rounded-2xl border p-4"
          >
            <option value='student'>
              Student
            </option>

            <option value='trainer'>
              Trainer
            </option>

            <option value='admin'>
              Admin
            </option>

          </select>



          {feedback.text && (

            <div className={
              feedback.type === 'success'
                ? 'rounded-xl bg-green-50 p-4 text-green-700'
                : 'rounded-xl bg-red-50 p-4 text-red-700'
            }
            >
              {feedback.text}
            </div>

          )}



          <button
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-teal-700 p-4 text-white font-semibold"
          >
            {
              isSubmitting
                ? 'Creating...'
                : 'Create User'
            }
          </button>

        </form>

      </div>



      {/* USER MANAGEMENT */}
      <div className="mx-auto mt-10 max-w-6xl rounded-3xl bg-white p-10 shadow-xl">

        <h2 className="text-3xl font-semibold mb-8">
          Manage Users
        </h2>


        <div className="grid gap-6">

          {users.map((u) => (

            <div
              key={u.id}
              className="rounded-2xl border p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >

              <div>

                <h3 className="font-semibold text-xl">
                  {u.first_name} {u.last_name}
                </h3>

                <p className="text-gray-500">
                  @{u.username}
                </p>

                <p className="mt-2">
                  Role:
                  <b> {u.role} </b>
                </p>

                <p>
                  Status:
                  <b>
                    {u.is_active
                      ? ' Active'
                      : ' Disabled'}
                  </b>
                </p>

              </div>



              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    handleEditUser(u.id)
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                >
                  Edit
                </button>



                {u.is_active ? (

                  <button
                    onClick={() =>
                      handleDisableUser(
                        u.id
                      )
                    }
                    className="rounded-xl bg-red-600 px-4 py-2 text-white"
                  >
                    Disable
                  </button>

                ) : (

                  <button
                    onClick={() =>
                      handleEnableUser(
                        u.id
                      )
                    }
                    className="rounded-xl bg-green-600 px-4 py-2 text-white"
                  >
                    Enable
                  </button>

                )}



                {u.has_active_session && (

                  <button
                    onClick={() =>
                      handleForceLogout(
                        u.id
                      )
                    }
                    className="rounded-xl bg-orange-500 px-4 py-2 text-white"
                  >
                    Force Logout
                  </button>

                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>

  );

}

export default CreateUser;