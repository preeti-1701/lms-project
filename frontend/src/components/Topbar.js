import "./Topbar.css";

export default function Topbar() {

  const role =
    localStorage.getItem("role");

  const username =
    localStorage.getItem("username");

  const logout = () => {

    localStorage.clear();

    window.location.href = "/";
  };

  return (

    <div className="topbar">

      <div>
        Learning Management System
      </div>

      <div className="topbar-right">

        <span>
          👤 {username}
        </span>

        <span>
          ({role})
        </span>

        <button onClick={logout}>
          Logout
        </button>

      </div>

    </div>
  );
}