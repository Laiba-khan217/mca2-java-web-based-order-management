import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, isAdmin, isOrderManager, isProcurementOfficer } = useAuth();

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-dark text-white min-vh-100" style={{ width: '260px' }}>
      <div className="d-flex align-items-center pb-3 mb-3 border-bottom text-decoration-none text-white">
        <i className="bi bi-gear-wide-connected fs-3 text-warning me-2"></i>
        <div>
          <span className="fs-5 fw-bold d-block lh-1">Apex OMS</span>
          <small className="text-muted text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>Manufacturing Suite</small>
        </div>
      </div>

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-1">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </NavLink>
        </li>

        {(isAdmin || isOrderManager) && (
          <>
            <li className="nav-header text-uppercase text-muted fw-bold px-3 pt-3 pb-1" style={{ fontSize: '0.7rem' }}>
              Sales & Orders
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/customers" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-building me-2"></i>
                Customers
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/sales-orders" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-cart-check me-2"></i>
                Sales Orders
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/bom" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-diagram-3 me-2"></i>
                Bill of Materials
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/invoices" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-receipt me-2"></i>
                Invoices
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/payments" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-cash-stack me-2"></i>
                Payments
              </NavLink>
            </li>
          </>
        )}

        {(isAdmin || isProcurementOfficer) && (
          <>
            <li className="nav-header text-uppercase text-muted fw-bold px-3 pt-3 pb-1" style={{ fontSize: '0.7rem' }}>
              Procurement & Inventory
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/suppliers" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-truck me-2"></i>
                Suppliers
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/raw-materials" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-boxes me-2"></i>
                Raw Materials
              </NavLink>
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/purchase-orders" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-clipboard2-check me-2"></i>
                Purchase Orders
              </NavLink>
            </li>
          </>
        )}

        <li className="nav-header text-uppercase text-muted fw-bold px-3 pt-3 pb-1" style={{ fontSize: '0.7rem' }}>
          Catalog & Masters
        </li>
        <li className="nav-item mb-1">
          <NavLink to="/products" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
            <i className="bi bi-box-seam me-2"></i>
            Finished Products
          </NavLink>
        </li>

        {isAdmin && (
          <>
            <li className="nav-header text-uppercase text-muted fw-bold px-3 pt-3 pb-1" style={{ fontSize: '0.7rem' }}>
              System Admin
            </li>
            <li className="nav-item mb-1">
              <NavLink to="/users" className={({ isActive }) => `nav-link d-flex align-items-center ${isActive ? 'active bg-primary' : 'text-white-50'}`}>
                <i className="bi bi-people-fill me-2"></i>
                User Management
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <div className="pt-3 border-top mt-auto">
        <div className="small text-muted">
          Logged in as:
          <div className="text-white fw-bold text-truncate">{user?.fullName || user?.username}</div>
        </div>
      </div>
    </div>
  );
}
