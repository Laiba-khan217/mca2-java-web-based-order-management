import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RawMaterialManagement() {
  const { isAdmin, isProcurementOfficer } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    materialCode: '',
    name: '',
    category: 'Steel Alloys',
    uom: 'KG',
    standardCost: '',
    currentStock: '0.00',
    reorderLevel: '10.00',
  });

  const loadMaterials = async () => {
    try {
      const res = await api.get('/raw-materials');
      setMaterials(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/raw-materials/${editId}`, formData);
      } else {
        await api.post('/raw-materials', formData);
      }
      setShowModal(false);
      setEditId(null);
      resetForm();
      loadMaterials();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save material');
    }
  };

  const resetForm = () => {
    setFormData({
      materialCode: '',
      name: '',
      category: 'Steel Alloys',
      uom: 'KG',
      standardCost: '',
      currentStock: '0.00',
      reorderLevel: '10.00',
    });
  };

  const handleEdit = (m) => {
    setEditId(m.id);
    setFormData({ ...m });
    setShowModal(true);
  };

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Raw Materials &amp; Inventory</h3>
          <p className="text-muted mb-0">Castings, shafts, wires, fasteners, seals, and powder coatings</p>
        </div>
        {(isAdmin || isProcurementOfficer) && (
          <button
            className="btn btn-warning text-dark fw-semibold shadow-sm"
            onClick={() => {
              setEditId(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-circle me-1"></i> Add Raw Material
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
              placeholder="Search Raw Materials by Name, Code, or Category..."
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
                <th>Material Name</th>
                <th>Category</th>
                <th>UOM</th>
                <th className="text-end">Standard Cost (INR)</th>
                <th className="text-end">Current Stock</th>
                <th className="text-end">Reorder Level</th>
                <th className="text-center">Stock Status</th>
                {(isAdmin || isProcurementOfficer) && <th className="text-end">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center py-4">Loading raw materials...</td></tr>
              ) : filtered.map((m) => {
                const stock = parseFloat(m.currentStock) || 0;
                const reorder = parseFloat(m.reorderLevel) || 0;
                const isLow = stock <= reorder;

                return (
                  <tr key={m.id}>
                    <td><code>{m.materialCode}</code></td>
                    <td className="fw-bold text-dark">{m.name}</td>
                    <td><span className="badge bg-light text-secondary border">{m.category}</span></td>
                    <td><span className="badge bg-secondary">{m.uom}</span></td>
                    <td className="text-end fw-bold">₹{Number(m.standardCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className={`text-end fw-bold ${isLow ? 'text-danger' : 'text-dark'}`}>{m.currentStock}</td>
                    <td className="text-end text-muted">{m.reorderLevel}</td>
                    <td className="text-center">
                      {isLow ? (
                        <span className="badge bg-danger"><i className="bi bi-bell-fill me-1"></i>REORDER NEEDED</span>
                      ) : (
                        <span className="badge bg-success">HEALTHY</span>
                      )}
                    </td>
                    {(isAdmin || isProcurementOfficer) && (
                      <td className="text-end">
                        <button className="btn btn-outline-warning btn-sm me-1 text-dark" onClick={() => handleEdit(m)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title fw-bold">{editId ? 'Edit Raw Material' : 'Add New Raw Material'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Material Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Material Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Auto-generated if empty"
                        value={formData.materialCode}
                        onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Unit of Measure (UOM) *</label>
                      <select
                        className="form-select"
                        value={formData.uom}
                        onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                      >
                        <option value="KG">KG (Kilogram)</option>
                        <option value="MTR">MTR (Meter)</option>
                        <option value="PCS">PCS (Piece)</option>
                        <option value="SET">SET</option>
                        <option value="LITRE">LITRE</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Standard Cost (INR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        required
                        value={formData.standardCost}
                        onChange={(e) => setFormData({ ...formData, standardCost: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Current Stock Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Reorder Threshold Level</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning btn-sm text-dark fw-semibold">{editId ? 'Update Material' : 'Save Material'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
