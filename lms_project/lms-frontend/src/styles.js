const styles = {

  // 🌌 APP BACKGROUND
  app: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
  },

  // 🔹 NAVBAR
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 30px",
    background: "#0f172a",
    color: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  navTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    letterSpacing: "1px",
  },

  // 🔹 MAIN LAYOUT
  container: {
    display: "flex",
    minHeight: "calc(100vh - 70px)",
  },

  // 🔹 SIDEBAR
  sidebar: {
    width: "240px",
    background: "#111827",
    color: "#fff",
    padding: "25px 15px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
  },

  sidebarItem: {
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "0.3s",
    fontWeight: "500",
    background: "transparent",
  },

  // 🔹 CONTENT
  content: {
    flex: 1,
    padding: "35px",
    overflowY: "auto",
  },

  // 🔹 DASHBOARD STATS
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  statsCard: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },

  statsNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: "10px",
  },

  // 🔹 CARDS
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },

  // 🔹 INPUTS
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "14px",
    background: "#f9fafb",
    boxSizing: "border-box",
  },

  // 🔹 BUTTONS
  button: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    marginRight: "10px",
    transition: "0.3s",
  },

  // 🔴 DANGER BUTTON
  dangerBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    marginRight: "10px",
    fontWeight: "600",
  },

  // 🔒 LOGOUT BUTTON
  logoutBtn: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  // 🎥 VIDEO CARD
  videoCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },

  // 🔐 LOGIN CONTAINER
  loginContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #0f172a, #1e293b)",
  },

  // 🔐 LOGIN BOX
  loginBox: {
    width: "400px",
    background: "#ffffff",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },

  loginTitle: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: "bold",
  },

  watermark: {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%) rotate(-20deg)",
  opacity: 0.12,
  fontSize: "28px",
  fontWeight: "bold",
  color: "#0f172a",
  pointerEvents: "none",
  zIndex: 9999,
  textAlign: "center",
  userSelect: "none",
},

};

export default styles;