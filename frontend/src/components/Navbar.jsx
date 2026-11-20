import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isOrderManager, isProcurementOfficer } = useAuth();

  const getRoleBadge = () => {
    if (isAdmin) return <span className="badge bg-danger">ADMIN</span>;
    if (isOrderManager) return <span className="badge bg-primary">ORDER MANAGER</span>;
    if (isProcurementOfficer) return <span className="badge bg-success">PROCUREMENT</span>;
    return <span className="badge bg-secondary">USER</span>;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm px-4 py-2">
      <div className="container-fluid p-0">
        <div className="d-flex align-items-center">
          <span className="navbar-brand mb-0 h1 fs-6 text-secondary fw-semibold">
            Enterprise Manufacturing Operations
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <div className="fw-bold text-dark">{user?.fullName}</div>
            <div className="mt-1">{getRoleBadge()}</div>
          </div>
          <button onClick={logout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
