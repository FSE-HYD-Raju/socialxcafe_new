import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RoleGuard({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
