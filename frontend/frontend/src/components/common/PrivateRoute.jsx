import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute() {
  const { token, user } = useSelector((state) => state.auth);
  
  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}