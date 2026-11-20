import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-primary text-white p-4 text-center">
            <div className="d-inline-flex p-3 bg-white bg-opacity-25 rounded-circle mb-3">
              <i className="bi bi-gear-wide-connected fs-1"></i>
            </div>
            <h3 className="fw-bold mb-1">Apex Manufacturing</h3>
            <p className="mb-0 text-white-50 small">Order Management System (OMS)</p>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-key"></i></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold shadow-sm" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-top">
              <div className="text-center text-muted small fw-semibold mb-2">⚡ Quick-Fill Demo Accounts:</div>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'Admin@123')}
                  className="btn btn-outline-danger btn-sm text-start d-flex justify-content-between align-items-center"
                >
                  <span><i className="bi bi-shield-lock me-1"></i> <strong>Admin</strong> (Rajesh Sharma)</span>
                  <span className="badge bg-danger">Full Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('ordermanager', 'Order@123')}
                  className="btn btn-outline-primary btn-sm text-start d-flex justify-content-between align-items-center"
                >
                  <span><i className="bi bi-cart me-1"></i> <strong>Order Manager</strong> (Priya Patel)</span>
                  <span className="badge bg-primary">Orders & BOM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('procurement', 'Procure@123')}
                  className="btn btn-outline-success btn-sm text-start d-flex justify-content-between align-items-center"
                >
                  <span><i className="bi bi-truck me-1"></i> <strong>Procurement</strong> (Amit Verma)</span>
                  <span className="badge bg-success">POs & Suppliers</span>
                </button>
              </div>
            </div>
          </div>

          <div className="card-footer bg-light text-center py-2 text-muted small">
            MCA 2nd Year Project &bull; Spring Boot 3 &amp; React 18
          </div>
        </div>
      </div>
    </div>
  );
}
