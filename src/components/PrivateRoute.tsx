import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
