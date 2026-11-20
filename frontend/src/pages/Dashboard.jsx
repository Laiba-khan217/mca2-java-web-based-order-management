import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const { user, isAdmin, isOrderManager, isProcurementOfficer } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Loading manufacturing executive metrics...</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge bg-warning text-dark">PENDING</span>;
      case 'CONFIRMED': return <span className="badge bg-primary">CONFIRMED</span>;
      case 'PROCESSING': return <span className="badge bg-info text-dark">PROCESSING</span>;
      case 'SHIPPED': return <span className="badge bg-indigo text-white" style={{ backgroundColor: '#6610f2' }}>SHIPPED</span>;
      case 'DELIVERED': return <span className="badge bg-success">DELIVERED</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div>
      {/* Top Welcome Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Apex Manufacturing Executive Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, <strong>{user?.fullName}</strong> ({user?.roles?.join(', ')})</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-success p-2 d-flex align-items-center">
            <i className="bi bi-check-circle-fill me-1"></i> System Online
          </span>
          <span className="badge bg-light text-dark border p-2">
            <i className="bi bi-calendar3 me-1 text-primary"></i> FY 2026-27 (INR)
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Sales Order Book</div>
                <div className="fs-3 fw-bold mt-1 text-dark">
                  ₹{Number(stats?.totalSalesRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-cart-check fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              <span className="text-primary fw-bold">{stats?.totalSalesOrders} Orders</span> ({stats?.pendingSalesOrders} pending confirmation)
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Procurement Spend</div>
                <div className="fs-3 fw-bold mt-1 text-dark">
                  ₹{Number(stats?.totalProcurementSpend || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <i className="bi bi-truck fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              <span className="text-info fw-bold">{stats?.totalPurchaseOrders} Purchase Orders</span> across suppliers
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Realized Collections</div>
                <div className="fs-3 fw-bold mt-1 text-success">
                  ₹{Number(stats?.totalCollectedPayments || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-cash-stack fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              <span className="text-success fw-bold">Settled Payments</span> via RTGS / NEFT / UPI
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-danger">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Receivables Balance</div>
                <div className="fs-3 fw-bold mt-1 text-danger">
                  ₹{Number(stats?.outstandingBalanceDue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <i className="bi bi-wallet2 fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              <span className="text-danger fw-bold">{stats?.totalInvoices} Invoices</span> issued to date
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner (If Any) */}
      {stats?.lowStockMaterialCount > 0 && (
        <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-exclamation-triangle-fill text-warning fs-5 me-2"></i>
            <strong>Inventory Alert:</strong> {stats.lowStockMaterialCount} raw material(s) have reached or fallen below their safety reorder level!
          </div>
          <Link to="/purchase-orders" className="btn btn-warning btn-sm fw-bold">
            Issue Replenishment PO &rarr;
          </Link>
        </div>
      )}

      {/* Main Grid: Monthly Trend & Recent Orders */}
      <div className="row g-4 mb-4">
        {/* Monthly Revenue Bars */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100 p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-bar-chart-fill text-primary me-2"></i>
              Monthly Order Book Trend
            </h5>
            <p className="text-muted small mb-4">Revenue booked across monthly billing cycles (INR):</p>

            <div className="d-flex flex-column gap-3">
              {stats?.monthlySales?.map(m => {
                const maxRev = Math.max(...stats.monthlySales.map(s => Number(s.revenue) || 1));
                const pct = Math.min(100, Math.round(((Number(m.revenue) || 0) / maxRev) * 100));

                return (
                  <div key={m.month}>
                    <div className="d-flex justify-content-between small fw-semibold mb-1">
                      <span>{m.label} ({m.orderCount} orders)</span>
                      <span className="text-primary">₹{Number(m.revenue).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="progress" style={{ height: '14px' }}>
                      <div
                        className="progress-bar bg-primary progress-bar-striped"
                        role="progressbar"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Manufacturing Operations Quick Jump */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100 p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-diagram-3-fill text-success me-2"></i>
              Core Department Navigation
            </h5>
            <p className="text-muted small mb-3">Quickly navigate to active department modules:</p>

            <div className="row g-2">
              <div className="col-6">
                <Link to="/sales-orders" className="card p-3 text-decoration-none border h-100 hover-shadow bg-light">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cart-check fs-3 text-primary me-3"></i>
                    <div>
                      <div className="fw-bold text-dark">Sales Orders</div>
                      <small className="text-muted">Create &amp; Track</small>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-6">
                <Link to="/bom" className="card p-3 text-decoration-none border h-100 hover-shadow bg-light">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-diagram-3 fs-3 text-info me-3"></i>
                    <div>
                      <div className="fw-bold text-dark">Bill of Materials</div>
                      <small className="text-muted">Explosion Engine</small>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-6">
                <Link to="/purchase-orders" className="card p-3 text-decoration-none border h-100 hover-shadow bg-light">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-truck fs-3 text-warning me-3"></i>
                    <div>
                      <div className="fw-bold text-dark">Purchase Orders</div>
                      <small className="text-muted">Procure &amp; Receive</small>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-6">
                <Link to="/invoices" className="card p-3 text-decoration-none border h-100 hover-shadow bg-light">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-receipt fs-3 text-success me-3"></i>
                    <div>
                      <div className="fw-bold text-dark">Tax Invoices</div>
                      <small className="text-muted">GST &amp; Billing</small>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Latest Customer Sales Orders</h5>
          <Link to="/sales-orders" className="btn btn-sm btn-outline-primary">View All Orders &rarr;</Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Order Number</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th className="text-end">Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map(o => (
                  <tr key={o.id}>
                    <td className="ps-3 fw-bold text-primary font-monospace">{o.orderNumber}</td>
                    <td>
                      <div className="fw-semibold">{o.customerName}</div>
                      <small className="text-muted">{o.customerCode}</small>
                    </td>
                    <td>{o.orderDate}</td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td className="text-end fw-bold">₹{Number(o.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
