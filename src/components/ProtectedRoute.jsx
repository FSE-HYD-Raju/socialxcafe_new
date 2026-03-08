import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("admin_logged_in") === "true";
  return isLoggedIn ? children : <Navigate to="/admin/login" />;
}
