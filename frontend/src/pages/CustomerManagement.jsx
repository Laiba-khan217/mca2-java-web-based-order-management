import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    customerCode: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    billingAddress: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const loadCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      loadCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const resetForm = () => {
    setFormData({
      customerCode: '',
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      gstin: '',
      billingAddress: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
    });
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setFormData({ ...c });
    setShowModal(true);
  };

  const filtered = customers.filter((c) =>
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Customer Accounts</h3>
          <p className="text-muted mb-0">Industrial client directory with GSTIN compliance and contact records</p>
        </div>
        <button
          className="btn btn-primary shadow-sm"
          onClick={() => {
            setEditId(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-1"></i> Add Customer
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Company Name, Customer Code, or City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Phone / Email</th>
                <th>GSTIN</th>
                <th>Location</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading customers...</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id}>
                  <td><code>{c.customerCode}</code></td>
                  <td className="fw-bold text-dark">{c.companyName}</td>
                  <td>{c.contactPerson || '-'}</td>
                  <td>
                    <div>{c.phone}</div>
                    <small className="text-muted">{c.email}</small>
                  </td>
                  <td><span className="badge bg-light text-dark border">{c.gstin || 'N/A'}</span></td>
                  <td>{c.city}, {c.state}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-primary btn-sm me-1" onClick={() => handleEdit(c)}>
                      <i className="bi bi-pencil"></i>
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Customer' : 'Add New Customer'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Company Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Customer Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-generated if empty"
                        value={formData.customerCode}
                        onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Contact Person</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">GSTIN (15 Chars)</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength={15}
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Billing Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.billingAddress}
                        onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">{editId ? 'Update Customer' : 'Save Customer'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
