import { Navigate } from "react-router-dom";
import { UseGlobalContext } from "../context/GlobalContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAdmin } = UseGlobalContext();
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
