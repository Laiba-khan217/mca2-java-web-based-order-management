import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CustomerManagement from './pages/CustomerManagement';
import SupplierManagement from './pages/SupplierManagement';
import ProductManagement from './pages/ProductManagement';
import RawMaterialManagement from './pages/RawMaterialManagement';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<ProductManagement />} />

              {/* Order Manager & Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ORDER_MANAGER']} />}>
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="/sales-orders" element={<div className="card p-4 border-0 shadow-sm"><h4>Sales Orders Module</h4><p className="text-muted">Sprint 2 Implementation Ready</p></div>} />
                <Route path="/bom" element={<div className="card p-4 border-0 shadow-sm"><h4>Bill of Materials Module</h4><p className="text-muted">Sprint 2 Implementation Ready</p></div>} />
                <Route path="/invoices" element={<div className="card p-4 border-0 shadow-sm"><h4>Invoices Module</h4><p className="text-muted">Sprint 3 Implementation Ready</p></div>} />
                <Route path="/payments" element={<div className="card p-4 border-0 shadow-sm"><h4>Payments Module</h4><p className="text-muted">Sprint 3 Implementation Ready</p></div>} />
              </Route>

              {/* Procurement Officer & Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PROCUREMENT_OFFICER']} />}>
                <Route path="/suppliers" element={<SupplierManagement />} />
                <Route path="/raw-materials" element={<RawMaterialManagement />} />
                <Route path="/purchase-orders" element={<div className="card p-4 border-0 shadow-sm"><h4>Purchase Orders Module</h4><p className="text-muted">Sprint 2 Implementation Ready</p></div>} />
              </Route>

              {/* Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
