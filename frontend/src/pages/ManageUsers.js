import {
  useEffect,
  useState
} from "react";

import api from "../api";

import Sidebar from "../components/Sidebar";

import Topbar from "../components/Topbar";

import "./Dashboard.css";

export default function ManageUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    api.get("users/list/")

      .then((res) => {

        setUsers(res.data);

      });

  }, []);

  return (

    <div className="layout">

      <Sidebar />

      <div className="main">

        <Topbar />

        <div className="content">

          <h1>
            Manage Users
          </h1>

          <table>

            <thead>

              <tr>

                <th>ID</th>

                <th>Username</th>

                <th>Role</th>

              </tr>

            </thead>

            <tbody>

              {users.map((u) => (

                <tr key={u.id}>

                  <td>{u.id}</td>

                  <td>{u.username}</td>

                  <td>{u.role}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}