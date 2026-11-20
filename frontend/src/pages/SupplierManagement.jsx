import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    supplierCode: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const loadSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/suppliers/${editId}`, formData);
      } else {
        await api.post('/suppliers', formData);
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      loadSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      supplierCode: '',
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      gstin: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setFormData({ ...s });
    setShowModal(true);
  };

  const filtered = suppliers.filter((s) =>
    s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.city && s.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Industrial Suppliers</h3>
          <p className="text-muted mb-0">Vendors supplying raw materials, fasteners, alloys, and components</p>
        </div>
        <button
          className="btn btn-success shadow-sm"
          onClick={() => {
            setEditId(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-1"></i> Add Supplier
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search Suppliers by Name, Code, or City..."
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
                <th>Supplier Company</th>
                <th>Contact Person</th>
                <th>Contact Info</th>
                <th>GSTIN</th>
                <th>Location</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading suppliers...</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id}>
                  <td><code>{s.supplierCode}</code></td>
                  <td className="fw-bold text-dark">{s.companyName}</td>
                  <td>{s.contactPerson || '-'}</td>
                  <td>
                    <div>{s.phone}</div>
                    <small className="text-muted">{s.email}</small>
                  </td>
                  <td><span className="badge bg-light text-dark border">{s.gstin || 'N/A'}</span></td>
                  <td>{s.city}, {s.state}</td>
                  <td className="text-end">
                    <button className="btn btn-outline-success btn-sm me-1" onClick={() => handleEdit(s)}>
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
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Supplier' : 'Add New Supplier'}</h5>
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
                      <label className="form-label small fw-semibold">Supplier Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-generated if empty"
                        value={formData.supplierCode}
                        onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
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
                      <label className="form-label small fw-semibold">GSTIN</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength={15}
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  <button type="submit" className="btn btn-success btn-sm">{editId ? 'Update Supplier' : 'Save Supplier'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
