import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PurchaseOrderManagement() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create PO Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPo, setNewPo] = useState({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: [{ rawMaterialId: '', quantityOrdered: 10, unitPrice: 0 }]
  });

  // Receive Goods Modal State
  const [selectedPo, setSelectedPo] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveInputs, setReceiveInputs] = useState({});

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliersAndMaterials();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchase-orders');
      setPurchaseOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch POs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliersAndMaterials = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/raw-materials')
      ]);
      setSuppliers(sRes.data.data || []);
      setRawMaterials(mRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch suppliers/materials', err);
    }
  };

  const handleAddItemRow = () => {
    setNewPo({
      ...newPo,
      items: [...newPo.items, { rawMaterialId: '', quantityOrdered: 10, unitPrice: 0 }]
    });
  };

  const handleRemoveItemRow = (idx) => {
    if (newPo.items.length === 1) return;
    setNewPo({
      ...newPo,
      items: newPo.items.filter((_, i) => i !== idx)
    });
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...newPo.items];
    updated[idx][field] = value;

    if (field === 'rawMaterialId') {
      const rm = rawMaterials.find(m => m.id === Number(value));
      if (rm) {
        updated[idx].unitPrice = rm.standardCost || 0;
      }
    }
    setNewPo({ ...newPo, items: updated });
  };

  const calculateTotals = () => {
    let subtotal = 0;
    newPo.items.forEach(it => {
      const qty = Number(it.quantityOrdered) || 0;
      const price = Number(it.unitPrice) || 0;
      subtotal += qty * price;
    });
    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;
    return { subtotal, taxAmount, grandTotal };
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    if (!newPo.supplierId) {
      alert('Please select a supplier');
      return;
    }
    if (newPo.items.some(it => !it.rawMaterialId || Number(it.quantityOrdered) <= 0)) {
      alert('Please fill out all line items with valid quantities');
      return;
    }

    try {
      await api.post('/purchase-orders', {
        supplierId: Number(newPo.supplierId),
        expectedDeliveryDate: newPo.expectedDeliveryDate || null,
        notes: newPo.notes,
        items: newPo.items.map(it => ({
          rawMaterialId: Number(it.rawMaterialId),
          quantityOrdered: Number(it.quantityOrdered),
          unitPrice: Number(it.unitPrice)
        }))
      });
      setShowCreateModal(false);
      setNewPo({
        supplierId: '',
        expectedDeliveryDate: '',
        notes: '',
        items: [{ rawMaterialId: '', quantityOrdered: 10, unitPrice: 0 }]
      });
      fetchPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create purchase order');
    }
  };

  const handleOpenReceive = (po) => {
    setSelectedPo(po);
    const initialInputs = {};
    po.items?.forEach(it => {
      const remaining = Math.max(0, Number(it.quantityOrdered) - Number(it.quantityReceived || 0));
      initialInputs[it.id] = remaining; // Default to full remaining
    });
    setReceiveInputs(initialInputs);
    setShowReceiveModal(true);
  };

  const handleReceiveGoodsSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemsPayload = Object.keys(receiveInputs).map(itemId => ({
        itemId: Number(itemId),
        quantityReceivedNow: Number(receiveInputs[itemId]) || 0
      }));

      await api.post(`/purchase-orders/${selectedPo.id}/receive`, {
        items: itemsPayload
      });
      alert('Goods received successfully! Raw material inventory stock has been replenished.');
      setShowReceiveModal(false);
      fetchPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record goods receipt');
    }
  };

  const handleUpdateStatus = async (poId, status) => {
    try {
      await api.patch(`/purchase-orders/${poId}/status`, { status });
      fetchPurchaseOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update PO status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT': return <span className="badge bg-secondary">DRAFT</span>;
      case 'ISSUED': return <span className="badge bg-primary">ISSUED</span>;
      case 'CONFIRMED': return <span className="badge bg-info text-dark">CONFIRMED</span>;
      case 'SHIPPED': return <span className="badge bg-warning text-dark">IN TRANSIT</span>;
      case 'RECEIVED': return <span className="badge bg-success">RECEIVED</span>;
      case 'CANCELLED': return <span className="badge bg-danger">CANCELLED</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = calculateTotals();

  // Metrics
  const totalSpend = purchaseOrders.reduce((sum, po) => sum + (Number(po.grandTotal) || 0), 0);
  const issuedCount = purchaseOrders.filter(po => po.status === 'ISSUED').length;
  const receivedCount = purchaseOrders.filter(po => po.status === 'RECEIVED').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Purchase Order Tracking</h2>
          <p className="text-muted mb-0">Issue supplier purchase orders, track inbound logistics, and auto-replenish warehouse stock upon receipt.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Create Purchase Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Purchase Orders</div>
            <div className="fs-3 fw-bold text-dark">{purchaseOrders.length}</div>
            <div className="text-primary small mt-1"><i className="bi bi-receipt me-1"></i> Cumulative orders</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-warning border-4">
            <div className="text-muted small text-uppercase fw-semibold">Issued / Open</div>
            <div className="fs-3 fw-bold text-dark">{issuedCount}</div>
            <div className="text-warning small mt-1"><i className="bi bi-hourglass-split me-1"></i> Awaiting delivery</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
            <div className="text-muted small text-uppercase fw-semibold">Goods Received</div>
            <div className="fs-3 fw-bold text-success">{receivedCount}</div>
            <div className="text-success small mt-1"><i className="bi bi-check-all me-1"></i> Stock replenished</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-info border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Procurement Spend</div>
            <div className="fs-3 fw-bold text-dark">₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-info small mt-1"><i className="bi bi-wallet2 me-1"></i> Committed capital</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by PO # or Supplier..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex justify-content-md-end flex-wrap gap-1">
              {['ALL', 'DRAFT', 'ISSUED', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED'].map(st => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">PO Number</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                  <th className="text-end">Grand Total (18% GST)</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">Loading purchase orders...</td></tr>
                ) : filteredPOs.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No purchase orders found.</td></tr>
                ) : (
                  filteredPOs.map(po => (
                    <tr key={po.id}>
                      <td className="ps-3 fw-bold text-primary font-monospace">{po.poNumber}</td>
                      <td>
                        <div className="fw-semibold">{po.supplierName}</div>
                        <small className="text-muted">{po.supplierCode}</small>
                      </td>
                      <td>{po.poDate}</td>
                      <td>{po.expectedDeliveryDate || '-'}</td>
                      <td>{getStatusBadge(po.status)}</td>
                      <td className="text-end fw-bold">₹{Number(po.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                            <button className="btn btn-outline-success" onClick={() => handleOpenReceive(po)}>
                              <i className="bi bi-box-arrow-in-down me-1"></i> Receive Goods
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown"
                          ></button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li><h6 className="dropdown-header">Change Status</h6></li>
                            {['CONFIRMED', 'SHIPPED', 'RECEIVED', 'CANCELLED'].map(st => (
                              <li key={st}>
                                <button className="dropdown-item" onClick={() => handleUpdateStatus(po.id, st)} disabled={po.status === st}>
                                  Mark as {st}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-file-earmark-plus me-2"></i>Create Supplier Purchase Order</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreatePo}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Supplier *</label>
                      <select
                        className="form-select"
                        required
                        value={newPo.supplierId}
                        onChange={e => setNewPo({ ...newPo, supplierId: e.target.value })}
                      >
                        <option value="">Select Supplier...</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.supplierCode} - {s.companyName} ({s.city}, {s.state})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Expected Delivery Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newPo.expectedDeliveryDate}
                        onChange={e => setNewPo({ ...newPo, expectedDeliveryDate: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">PO Notes / Terms</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Delivery terms CIF, payment within 30 days of GRN"
                        value={newPo.notes}
                        onChange={e => setNewPo({ ...newPo, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Items Builder */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-uppercase text-muted mb-0">Raw Material Items</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddItemRow}>
                      <i className="bi bi-plus me-1"></i> Add Material
                    </button>
                  </div>

                  <div className="table-responsive border rounded mb-3">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '45%' }}>Raw Material Component *</th>
                          <th style={{ width: '20%' }}>Quantity Ordered *</th>
                          <th style={{ width: '20%' }}>Unit Price (INR)</th>
                          <th style={{ width: '15%' }} className="text-end">Line Total</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newPo.items.map((item, idx) => {
                          const qty = Number(item.quantityOrdered) || 0;
                          const price = Number(item.unitPrice) || 0;
                          const lineTot = qty * price;

                          return (
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
                                      {rm.materialCode} - {rm.name} (Stock: {rm.currentStock} {rm.uom})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  required
                                  className="form-control form-control-sm"
                                  value={item.quantityOrdered}
                                  onChange={e => handleItemChange(idx, 'quantityOrdered', e.target.value)}
                                />
                              </td>
                              <td>
                                <div className="input-group input-group-sm">
                                  <span className="input-group-text">₹</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    value={item.unitPrice}
                                    onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                                  />
                                </div>
                              </td>
                              <td className="text-end fw-bold">
                                ₹{lineTot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-danger p-0"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  disabled={newPo.items.length === 1}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations */}
                  <div className="row justify-content-end">
                    <div className="col-md-5">
                      <div className="card bg-light border-0 p-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Subtotal:</span>
                          <span className="fw-semibold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">GST Tax (18%):</span>
                          <span className="fw-semibold">₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between pt-2 border-top">
                          <span className="fs-5 fw-bold">Grand Total:</span>
                          <span className="fs-5 fw-bold text-primary">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Issue Purchase Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* RECEIVE GOODS MODAL */}
      {showReceiveModal && selectedPo && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-box-arrow-in-down me-2"></i>
                  Goods Receipt (GRN) for {selectedPo.poNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReceiveModal(false)}></button>
              </div>
              <form onSubmit={handleReceiveGoodsSubmit}>
                <div className="modal-body p-4">
                  <div className="alert alert-info border-0 mb-3 small">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    Entering received quantities here will automatically update the <strong>raw_materials.current_stock</strong> column in the database and fulfill this Purchase Order.
                  </div>

                  <div className="table-responsive border rounded mb-3">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Material</th>
                          <th className="text-center">Ordered</th>
                          <th className="text-center">Prior Received</th>
                          <th style={{ width: '25%' }} className="text-center">Quantity Received Now</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPo.items?.map(it => {
                          const ordered = Number(it.quantityOrdered) || 0;
                          const prior = Number(it.quantityReceived) || 0;
                          const remaining = Math.max(0, ordered - prior);

                          return (
                            <tr key={it.id}>
                              <td>
                                <div className="fw-semibold">{it.materialName}</div>
                                <small className="text-muted">{it.materialCode} ({it.uom})</small>
                              </td>
                              <td className="text-center fw-semibold">{ordered} {it.uom}</td>
                              <td className="text-center text-muted">{prior} {it.uom}</td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={remaining}
                                  required
                                  className="form-control text-center fw-bold text-success"
                                  value={receiveInputs[it.id] ?? remaining}
                                  onChange={e => setReceiveInputs({
                                    ...receiveInputs,
                                    [it.id]: e.target.value
                                  })}
                                />
                                <div className="text-center small text-muted mt-1">Remaining: {remaining}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReceiveModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4 fw-bold">Confirm & Replenish Stock</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
