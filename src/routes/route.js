import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Authmiddleware = ({ children }) => {
  const location = useLocation();
  const storedUser = localStorage.getItem("authUser");

  if (!storedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const { token } = JSON.parse(storedUser);
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds

    if (decoded.exp < currentTime) {
      localStorage.removeItem("authUser");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch (error) {
    localStorage.removeItem("authUser");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default Authmiddleware;
