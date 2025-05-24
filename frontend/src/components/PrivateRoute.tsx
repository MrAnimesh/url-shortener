import { Navigate } from "react-router-dom";
import React from "react";

interface PrivateRouteProps {
    children: React.ReactNode;
  }

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
