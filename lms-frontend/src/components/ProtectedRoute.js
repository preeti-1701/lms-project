import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const token =
    localStorage.getItem("access") ||
    sessionStorage.getItem("access");

  console.log("TOKEN:", token);

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;