import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = user.roles && user.roles.some((role) => allowedRoles.includes(role));
    if (!hasPermission) {
      return (
        <div className="container py-5 text-center">
          <div className="card shadow-sm p-5 border-0">
            <h3 className="text-danger fw-bold"><i className="bi bi-shield-lock-fill me-2"></i>Access Denied</h3>
            <p className="text-muted mt-2">You do not have permission to view this page with your current role.</p>
            <div>
              <a href="/dashboard" className="btn btn-primary mt-3">Back to Dashboard</a>
            </div>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
}
