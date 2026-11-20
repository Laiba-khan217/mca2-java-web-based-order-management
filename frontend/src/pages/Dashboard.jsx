import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, isAdmin, isOrderManager, isProcurementOfficer } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    suppliers: 0,
    products: 0,
    materials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [cRes, sRes, pRes, mRes] = await Promise.all([
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/suppliers').catch(() => ({ data: { data: [] } })),
          api.get('/products').catch(() => ({ data: { data: [] } })),
          api.get('/raw-materials').catch(() => ({ data: { data: [] } })),
        ]);
        setStats({
          customers: cRes.data?.data?.length || 0,
          suppliers: sRes.data?.data?.length || 0,
          products: pRes.data?.data?.length || 0,
          materials: mRes.data?.data?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load summary stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Executive Manufacturing Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, <strong>{user?.fullName}</strong> ({user?.roles?.join(', ')})</p>
        </div>
        <div className="badge bg-light text-dark border p-2">
          <i className="bi bi-calendar3 me-1 text-primary"></i> FY 2026-27 (INR)
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Enterprise Clients</div>
                <div className="fs-3 fw-bold mt-1 text-dark">{loading ? '...' : stats.customers}</div>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-building fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small"><span className="text-success fw-bold">Active</span> Manufacturing Customers</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Approved Vendors</div>
                <div className="fs-3 fw-bold mt-1 text-dark">{loading ? '...' : stats.suppliers}</div>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-truck fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small"><span className="text-success fw-bold">GST-Registered</span> Industrial Suppliers</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Manufactured Goods</div>
                <div className="fs-3 fw-bold mt-1 text-dark">{loading ? '...' : stats.products}</div>
              </div>
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <i className="bi bi-box-seam fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">Catalog Products with BOM recipes</div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold text-uppercase">Raw Materials</div>
                <div className="fs-3 fw-bold mt-1 text-dark">{loading ? '...' : stats.materials}</div>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <i className="bi bi-boxes fs-4"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">Tracked Inventory Stocks &amp; Scrap Buffers</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-diagram-3-fill text-primary me-2"></i>Manufacturing Workflow Pipeline</h5>
            <div className="p-3 bg-light rounded-3">
              <div className="row text-center g-2">
                <div className="col">
                  <div className="p-2 bg-white rounded shadow-sm border">
                    <span className="badge bg-secondary mb-1">Step 1</span>
                    <div className="fw-bold small">Sales Order</div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Auto 18% GST</small>
                  </div>
                </div>
                <div className="col-auto d-flex align-items-center text-muted">&rarr;</div>
                <div className="col">
                  <div className="p-2 bg-white rounded shadow-sm border">
                    <span className="badge bg-primary mb-1">Step 2</span>
                    <div className="fw-bold small">BOM Explosion</div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Gross Demand + Scrap</small>
                  </div>
                </div>
                <div className="col-auto d-flex align-items-center text-muted">&rarr;</div>
                <div className="col">
                  <div className="p-2 bg-white rounded shadow-sm border">
                    <span className="badge bg-warning text-dark mb-1">Step 3</span>
                    <div className="fw-bold small">PO Procurement</div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>Replenish Shortfall</small>
                  </div>
                </div>
                <div className="col-auto d-flex align-items-center text-muted">&rarr;</div>
                <div className="col">
                  <div className="p-2 bg-white rounded shadow-sm border">
                    <span className="badge bg-success mb-1">Step 4</span>
                    <div className="fw-bold small">Invoice &amp; Pay</div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>GST Tax Invoice</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h6 className="fw-bold text-muted small text-uppercase">Role Quick Actions:</h6>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {(isAdmin || isOrderManager) && (
                  <a href="/customers" className="btn btn-outline-primary btn-sm"><i className="bi bi-building me-1"></i>Manage Customers</a>
                )}
                {(isAdmin || isProcurementOfficer) && (
                  <a href="/suppliers" className="btn btn-outline-success btn-sm"><i className="bi bi-truck me-1"></i>Manage Suppliers</a>
                )}
                <a href="/products" className="btn btn-outline-info btn-sm"><i className="bi bi-box-seam me-1"></i>View Product Catalog</a>
                {(isAdmin || isProcurementOfficer) && (
                  <a href="/raw-materials" className="btn btn-outline-warning btn-sm"><i className="bi bi-boxes me-1"></i>Check Raw Materials</a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-info-circle-fill text-info me-2"></i>System Status</h5>
            <ul className="list-group list-group-flush small">
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Database Engine</span>
                <span className="badge bg-success">MySQL 8.0 (oms_db)</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Normalized Tables</span>
                <span className="fw-bold">15 3NF Tables</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Backend Framework</span>
                <span className="badge bg-primary">Spring Boot 3.3.5</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Security Engine</span>
                <span className="badge bg-dark">Spring Security 6 (JWT)</span>
              </li>
              <li className="list-group-item d-flex justify-content-between px-0">
                <span>Password Hashing</span>
                <span className="badge bg-secondary">BCrypt (10 Rounds)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
