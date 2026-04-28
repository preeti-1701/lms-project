
import Sidebar from "./Sidebar";export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ padding: 20, width: "100%" }}>
        {children}
      </div>
    </div>
  );
}