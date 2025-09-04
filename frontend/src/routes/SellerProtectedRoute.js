import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";


const SellerProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has seller or admin role
  if (user.role !== "seller" && user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default SellerProtectedRoute;
