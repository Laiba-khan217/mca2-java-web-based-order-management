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
import SalesOrderManagement from './pages/SalesOrderManagement';
import BomManagement from './pages/BomManagement';
import PurchaseOrderManagement from './pages/PurchaseOrderManagement';
import InvoiceManagement from './pages/InvoiceManagement';
import PaymentManagement from './pages/PaymentManagement';

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
              <Route path="/bom" element={<BomManagement />} />

              {/* Order Manager & Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ORDER_MANAGER']} />}>
                <Route path="/customers" element={<CustomerManagement />} />
                <Route path="/sales-orders" element={<SalesOrderManagement />} />
                <Route path="/invoices" element={<InvoiceManagement />} />
                <Route path="/payments" element={<PaymentManagement />} />
              </Route>

              {/* Procurement Officer & Admin */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PROCUREMENT_OFFICER']} />}>
                <Route path="/suppliers" element={<SupplierManagement />} />
                <Route path="/raw-materials" element={<RawMaterialManagement />} />
                <Route path="/purchase-orders" element={<PurchaseOrderManagement />} />
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
