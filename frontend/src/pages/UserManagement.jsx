import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roles: ['ROLE_ORDER_MANAGER'],
  });

  const loadData = async () => {
    try {
      const [uRes, rRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);
      setUsers(uRes.data?.data || []);
      setRoles(rRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        roles: ['ROLE_ORDER_MANAGER'],
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);
      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">User &amp; Role Management</h3>
          <p className="text-muted mb-0">Administer system users, role-based privileges, and account status</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={() => setShowModal(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Add New User
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Roles</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading users...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw-bold">{u.firstName} {u.lastName}</div>
                  </td>
                  <td><code>{u.username}</code></td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    {u.roles && Array.from(u.roles).map((r) => (
                      <span key={r} className={`badge me-1 ${r === 'ROLE_ADMIN' ? 'bg-danger' : r === 'ROLE_ORDER_MANAGER' ? 'bg-primary' : 'bg-success'}`}>
                        {r.replace('ROLE_', '')}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => handleToggleStatus(u.id)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Create System User</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="row g-2 mb-2">
                    <div className="col">
                      <label className="form-label small fw-semibold">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label small fw-semibold">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Assign Role</label>
                    <select
                      className="form-select"
                      value={formData.roles[0]}
                      onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                    >
                      <option value="ROLE_ADMIN">Admin (Full Control)</option>
                      <option value="ROLE_ORDER_MANAGER">Order Manager (Sales, BOM, Invoices)</option>
                      <option value="ROLE_PROCUREMENT_OFFICER">Procurement Officer (POs &amp; Suppliers)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Create User Account</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
