import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProductManagement() {
  const { isAdmin, isOrderManager } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    productCode: '',
    name: '',
    category: 'Industrial Pumps',
    description: '',
    unitPrice: '',
    gstRate: '18.00',
    uom: 'PCS',
    currentStock: 0,
    minimumStockAlert: 5,
  });

  const loadProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/products/${editId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const resetForm = () => {
    setFormData({
      productCode: '',
      name: '',
      category: 'Industrial Pumps',
      description: '',
      unitPrice: '',
      gstRate: '18.00',
      uom: 'PCS',
      currentStock: 0,
      minimumStockAlert: 5,
    });
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setFormData({ ...p });
    setShowModal(true);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Finished Products Catalog</h3>
          <p className="text-muted mb-0">Industrial machinery, pumps, motors, conveyors, and valves</p>
        </div>
        {(isAdmin || isOrderManager) && (
          <button
            className="btn btn-primary shadow-sm"
            onClick={() => {
              setEditId(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i> Add Product
          </button>
        )}
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Product Name, Code, or Category..."
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
                <th>Product Name</th>
                <th>Category</th>
                <th className="text-end">Unit Price (INR)</th>
                <th>GST Rate</th>
                <th className="text-center">Stock</th>
                <th className="text-center">Status</th>
                {(isAdmin || isOrderManager) && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4">Loading products...</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id}>
                  <td><code>{p.productCode}</code></td>
                  <td>
                    <div className="fw-bold text-dark">{p.name}</div>
                    <small className="text-muted">{p.description}</small>
                  </td>
                  <td><span className="badge bg-light text-secondary border">{p.category}</span></td>
                  <td className="text-end fw-bold">₹{Number(p.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>{p.gstRate}%</td>
                  <td className="text-center">
                    <span className={`fw-bold ${p.currentStock <= p.minimumStockAlert ? 'text-danger' : 'text-dark'}`}>
                      {p.currentStock} {p.uom}
                    </span>
                  </td>
                  <td className="text-center">
                    {p.currentStock <= p.minimumStockAlert ? (
                      <span className="badge bg-warning text-dark"><i className="bi bi-exclamation-triangle me-1"></i>LOW STOCK</span>
                    ) : (
                      <span className="badge bg-success">IN STOCK</span>
                    )}
                  </td>
                  {(isAdmin || isOrderManager) && (
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm me-1" onClick={() => handleEdit(p)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                    </td>
                  )}
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
                <h5 className="modal-title fw-bold">{editId ? 'Edit Product' : 'Add New Product'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Product Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Product Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-generated if empty"
                        value={formData.productCode}
                        onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Unit Price (INR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        required
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Unit of Measure (UOM)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.uom}
                        onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Current Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Minimum Stock Alert</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.minimumStockAlert}
                        onChange={(e) => setFormData({ ...formData, minimumStockAlert: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">{editId ? 'Update Product' : 'Save Product'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
