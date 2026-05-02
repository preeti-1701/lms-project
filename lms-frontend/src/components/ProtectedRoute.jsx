import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Usage:
 *   <ProtectedRoute />                     — any logged-in user
 *   <ProtectedRoute roles={["admin"]} />   — admin only
 *   <ProtectedRoute roles={["admin","trainer"]} />
 */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}