import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function BomManagement() {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Create/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingBomId, setEditingBomId] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    version: '1.0',
    notes: '',
    isActive: true,
    items: [{ rawMaterialId: '', quantityRequired: 1, scrapPercentage: 0, uom: '' }]
  });

  // Simulator State
  const [simProductId, setSimProductId] = useState('');
  const [simQuantity, setSimQuantity] = useState(10);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    fetchBoms();
    fetchMasters();
  }, []);

  const fetchBoms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/boms');
      setBoms(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch BOMs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const [pRes, rmRes] = await Promise.all([
        api.get('/products'),
        api.get('/raw-materials')
      ]);
      setProducts(pRes.data.data || []);
      setRawMaterials(rmRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch masters', err);
    }
  };

  const handleOpenCreate = () => {
    setEditingBomId(null);
    setFormData({
      productId: '',
      version: '1.0',
      notes: '',
      isActive: true,
      items: [{ rawMaterialId: '', quantityRequired: 1, scrapPercentage: 0, uom: '' }]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bom) => {
    setEditingBomId(bom.id);
    setFormData({
      productId: bom.productId,
      version: bom.version || '1.0',
      notes: bom.notes || '',
      isActive: bom.isActive,
      items: bom.items?.map(it => ({
        rawMaterialId: it.rawMaterialId,
        quantityRequired: it.quantityRequired,
        scrapPercentage: it.scrapPercentage,
        uom: it.uom
      })) || [{ rawMaterialId: '', quantityRequired: 1, scrapPercentage: 0, uom: '' }]
    });
    setShowModal(true);
  };

  const handleAddItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { rawMaterialId: '', quantityRequired: 1, scrapPercentage: 0, uom: '' }]
    });
  };

  const handleRemoveItemRow = (idx) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== idx)
    });
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...formData.items];
    updated[idx][field] = value;

    if (field === 'rawMaterialId') {
      const rm = rawMaterials.find(m => m.id === Number(value));
      if (rm) {
        updated[idx].uom = rm.uom;
      }
    }
    setFormData({ ...formData, items: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId) {
      alert('Please select a product');
      return;
    }
    if (formData.items.some(it => !it.rawMaterialId || Number(it.quantityRequired) <= 0)) {
      alert('Please complete all component rows with valid quantities');
      return;
    }

    try {
      const payload = {
        productId: Number(formData.productId),
        version: formData.version,
        notes: formData.notes,
        isActive: formData.isActive,
        items: formData.items.map(it => ({
          rawMaterialId: Number(it.rawMaterialId),
          quantityRequired: Number(it.quantityRequired),
          scrapPercentage: Number(it.scrapPercentage) || 0,
          uom: it.uom
        }))
      };

      if (editingBomId) {
        await api.put(`/boms/${editingBomId}`, payload);
      } else {
        await api.post('/boms', payload);
      }
      setShowModal(false);
      fetchBoms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save Bill of Materials');
    }
  };

  const handleSimulate = async () => {
    if (!simProductId) {
      alert('Please choose a manufactured product to simulate');
      return;
    }
    try {
      setSimLoading(true);
      const res = await api.get(`/boms/explode/product/${simProductId}?quantity=${simQuantity || 1}`);
      setSimResult(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'BOM simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Bill of Materials (BOM)</h2>
          <p className="text-muted mb-0">Define production recipes, engineering component hierarchies, and scrap allowances.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={handleOpenCreate}>
          <i className="bi bi-plus-circle me-2"></i>
          Create New BOM
        </button>
      </div>

      {/* Simulator Section */}
      <div className="card border-0 shadow-sm mb-4 bg-light border-start border-primary border-4">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-2"><i className="bi bi-cpu text-primary me-2"></i>Batch Production BOM Explosion Simulator</h5>
          <p className="text-muted small mb-3">Calculate exact gross raw material quantities, scrap buffers, and identify warehouse stock shortfalls for planned production batches.</p>

          <div className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Select Finished Product</label>
              <select
                className="form-select"
                value={simProductId}
                onChange={e => setSimProductId(e.target.value)}
              >
                <option value="">Choose product with defined BOM...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.productCode} - {p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Planned Batch Size (Units)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={simQuantity}
                onChange={e => setSimQuantity(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-primary w-100 fw-semibold"
                onClick={handleSimulate}
                disabled={simLoading}
              >
                {simLoading ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
          </div>

          {/* Simulation Output */}
          {simResult && (
            <div className="mt-4 pt-3 border-top">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Simulation Results: {simResult.productName} ({simResult.orderQuantity} Units)</h6>
                <div className="badge bg-dark">
                  Shortfall Cost: ₹{Number(simResult.totalShortfallCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="table-responsive border rounded bg-white">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Material</th>
                      <th className="text-end">Gross Req.</th>
                      <th className="text-end">Scrap Buffer</th>
                      <th className="text-end">Total Needed</th>
                      <th className="text-end">Current Stock</th>
                      <th className="text-center">Status</th>
                      <th className="text-end">Shortfall</th>
                      <th className="text-end">Procurement Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simResult.requirements?.map((req, i) => (
                      <tr key={i} className={req.status === 'SHORTFALL' ? 'table-warning' : ''}>
                        <td>
                          <span className="fw-bold font-monospace">{req.materialCode}</span> - {req.materialName}
                        </td>
                        <td className="text-end">{req.grossRequired} {req.uom}</td>
                        <td className="text-end text-muted">+{req.scrapBuffer}</td>
                        <td className="text-end fw-bold">{req.totalRequired} {req.uom}</td>
                        <td className="text-end">{req.currentStock} {req.uom}</td>
                        <td className="text-center">
                          {req.status === 'SUFFICIENT' ? (
                            <span className="badge bg-success">SUFFICIENT</span>
                          ) : (
                            <span className="badge bg-danger">SHORTFALL</span>
                          )}
                        </td>
                        <td className="text-end text-danger fw-bold">{Number(req.shortfall) > 0 ? `${req.shortfall} ${req.uom}` : '-'}</td>
                        <td className="text-end fw-bold">{Number(req.shortfallCost) > 0 ? `₹${Number(req.shortfallCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOM Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="fw-bold mb-0">Active Bills of Materials Recipes</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">BOM Number</th>
                  <th>Product</th>
                  <th>Version</th>
                  <th>Components</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">Loading BOM definitions...</td></tr>
                ) : boms.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No Bills of Materials defined.</td></tr>
                ) : (
                  boms.map(b => (
                    <tr key={b.id}>
                      <td className="ps-3 fw-bold text-primary font-monospace">{b.bomNumber}</td>
                      <td>
                        <div className="fw-semibold">{b.productName}</div>
                        <small className="text-muted">{b.productCode}</small>
                      </td>
                      <td><span className="badge bg-light text-dark border">v{b.version}</span></td>
                      <td><span className="badge bg-info text-dark">{b.items?.length || 0} Items</span></td>
                      <td>
                        {b.isActive ? (
                          <span className="badge bg-success">ACTIVE</span>
                        ) : (
                          <span className="badge bg-secondary">INACTIVE</span>
                        )}
                      </td>
                      <td className="text-muted small">{b.notes || '-'}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenEdit(b)}>
                          <i className="bi bi-pencil me-1"></i> Edit Recipe
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT BOM MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editingBomId ? 'Edit Bill of Materials' : 'Create New Bill of Materials'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Target Finished Product *</label>
                      <select
                        className="form-select"
                        required
                        value={formData.productId}
                        onChange={e => setFormData({ ...formData, productId: e.target.value })}
                        disabled={!!editingBomId}
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.productCode} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Version</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.version}
                        onChange={e => setFormData({ ...formData, version: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Engineering Notes</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Revision includes higher tensile steel shaft specification"
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Components Builder */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-uppercase text-muted mb-0">Recipe Component Hierarchy</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddItemRow}>
                      <i className="bi bi-plus me-1"></i> Add Component
                    </button>
                  </div>

                  <div className="table-responsive border rounded mb-3">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '45%' }}>Raw Material Component *</th>
                          <th style={{ width: '20%' }}>Quantity Per Unit *</th>
                          <th style={{ width: '15%' }}>Scrap % Buffer</th>
                          <th style={{ width: '15%' }}>UOM</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                required
                                value={item.rawMaterialId}
                                onChange={e => handleItemChange(idx, 'rawMaterialId', e.target.value)}
                              >
                                <option value="">Select Raw Material...</option>
                                {rawMaterials.map(rm => (
                                  <option key={rm.id} value={rm.id}>
                                    {rm.materialCode} - {rm.name} ({rm.category})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.0001"
                                min="0.0001"
                                required
                                className="form-control form-control-sm"
                                value={item.quantityRequired}
                                onChange={e => handleItemChange(idx, 'quantityRequired', e.target.value)}
                              />
                            </td>
                            <td>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="form-control"
                                  value={item.scrapPercentage}
                                  onChange={e => handleItemChange(idx, 'scrapPercentage', e.target.value)}
                                />
                                <span className="input-group-text">%</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">{item.uom || '-'}</span>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-danger p-0"
                                onClick={() => handleRemoveItemRow(idx)}
                                disabled={formData.items.length === 1}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Save BOM Recipe</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
