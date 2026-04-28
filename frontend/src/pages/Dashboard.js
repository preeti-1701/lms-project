import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="layout">
      <Sidebar />

      <div className="dashboard">
        <h1>Welcome to Dashboard 👋</h1>

        <div className="stats">
          <div className="card">📚 Courses: 2</div>
          <div className="card">🎥 Videos: 10</div>
          <div className="card">👨‍🎓 Students: 5</div>
        </div>
      </div>
    </div>
  );
}