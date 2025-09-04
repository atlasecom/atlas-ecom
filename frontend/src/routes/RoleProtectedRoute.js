import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  hasAnyRole,
  canAccessSellerDashboard,
  canAccessAdminDashboard,
} from "../utils/roleUtils";

// General role-based protected route
export const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/login",
}) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !hasAnyRole(user, allowedRoles)) {
    // Redirect based on user role if they don't have permission
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "seller") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Seller dashboard protection (sellers and admins)
export const SellerProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/shop-login" replace />;
  }

  if (!canAccessSellerDashboard(user)) {
    return <Navigate to="/shop-login" replace />;
  }

  return children;
};

// Admin dashboard protection (admins only)
export const AdminProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessAdminDashboard(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Regular user protection (any authenticated user)
export const UserProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserProtectedRoute;
