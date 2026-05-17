import { useEffect, useState } from "react";

import API from "../services/api";

export default function AdminDashboard() {

  const [users, setUsers] = useState([]);

  // fetch users
  const fetchUsers = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get(
        "/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data.users);

    } catch (error) {

      console.log(error);

      alert("Cannot fetch users");
    }
  };

  useEffect(() => {

    fetchUsers();

  }, []);

  // delete user
  const handleDeleteUser = async (id) => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.delete(

        `/admin/users/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);

      fetchUsers();

    } catch (error) {

      console.log(error);

      alert("Delete failed");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0b0146",
        minHeight: "100vh",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: "30px" }}>
        Admin Dashboard
      </h1>

      <div
        style={{
          backgroundColor: "#111827",
          padding: "30px",
          borderRadius: "15px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          All Users
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  borderBottom: "1px solid gray",
                  padding: "15px",
                  textAlign: "left",
                }}
              >
                Name
              </th>

              <th
                style={{
                  borderBottom: "1px solid gray",
                  padding: "15px",
                  textAlign: "left",
                }}
              >
                Email
              </th>

              <th
                style={{
                  borderBottom: "1px solid gray",
                  padding: "15px",
                  textAlign: "left",
                }}
              >
                Role
              </th>

              <th
                style={{
                  borderBottom: "1px solid gray",
                  padding: "15px",
                  textAlign: "left",
                }}
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (

              <tr key={user.id}>

                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  {user.name}
                </td>

                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  {user.email}
                </td>

                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  {user.role}
                </td>

                <td
                  style={{
                    padding: "15px",
                  }}
                >
                  <button
                    onClick={() =>
                      handleDeleteUser(user.id)
                    }
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={() => {

            localStorage.clear();

            window.location.href = "/";
          }}
          style={{
            marginTop: "30px",
            padding: "12px 20px",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}