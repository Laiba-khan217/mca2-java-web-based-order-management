import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <Navbar />
        <main className="flex-grow-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
