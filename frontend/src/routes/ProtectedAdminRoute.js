import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { canAccessAdminDashboard } from "../utils/roleUtils";

const ProtectedAdminRoute = ({ children }) => {
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

export default ProtectedAdminRoute;
