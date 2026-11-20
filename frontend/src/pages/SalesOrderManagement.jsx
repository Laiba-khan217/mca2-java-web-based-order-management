import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function SalesOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Order Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerId: '',
    expectedDeliveryDate: '',
    notes: '',
    discountAmount: 0,
    items: [{ productId: '', quantity: 1, unitPrice: 0, gstRate: 18 }]
  });

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // BOM Explosion Modal State
  const [bomExplosion, setBomExplosion] = useState(null);
  const [showExplosionModal, setShowExplosionModal] = useState(false);
  const [explosionLoading, setExplosionLoading] = useState(false);

  // Status Update State
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchCustomersAndProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales-orders');
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch sales orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersAndProducts = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products')
      ]);
      setCustomers(cRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch master data', err);
    }
  };

  const handleAddItemRow = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { productId: '', quantity: 1, unitPrice: 0, gstRate: 18 }]
    });
  };

  const handleRemoveItemRow = (index) => {
    if (newOrder.items.length === 1) return;
    const updated = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...newOrder.items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prod = products.find(p => p.id === Number(value));
      if (prod) {
        updated[index].unitPrice = prod.unitPrice || 0;
        updated[index].gstRate = prod.gstRate || 18;
      }
    }
    setNewOrder({ ...newOrder, items: updated });
  };

  // Calculations for New Order
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    newOrder.items.forEach(it => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      const gst = Number(it.gstRate) || 18;
      const lineSub = qty * price;
      const lineTax = lineSub * (gst / 100);
      subtotal += lineSub;
      taxAmount += lineTax;
    });
    const discount = Number(newOrder.discountAmount) || 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);
    return { subtotal, taxAmount, discount, grandTotal };
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerId) {
      alert('Please select a customer');
      return;
    }
    if (newOrder.items.some(it => !it.productId || it.quantity <= 0)) {
      alert('Please fill out all order line items with valid quantities');
      return;
    }

    try {
      await api.post('/sales-orders', {
        customerId: Number(newOrder.customerId),
        expectedDeliveryDate: newOrder.expectedDeliveryDate || null,
        notes: newOrder.notes,
        discountAmount: Number(newOrder.discountAmount) || 0,
        items: newOrder.items.map(it => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          gstRate: Number(it.gstRate)
        }))
      });
      setShowCreateModal(false);
      setNewOrder({
        customerId: '',
        expectedDeliveryDate: '',
        notes: '',
        discountAmount: 0,
        items: [{ productId: '', quantity: 1, unitPrice: 0, gstRate: 18 }]
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create sales order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await api.patch(`/sales-orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleRunBOMExplosion = async (orderId) => {
    try {
      setExplosionLoading(true);
      setShowExplosionModal(true);
      const res = await api.get(`/boms/explode/order/${orderId}`);
      setBomExplosion(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate BOM explosion');
      setShowExplosionModal(false);
    } finally {
      setExplosionLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="badge bg-warning text-dark">PENDING</span>;
      case 'CONFIRMED': return <span className="badge bg-primary">CONFIRMED</span>;
      case 'PROCESSING': return <span className="badge bg-info text-dark">PROCESSING</span>;
      case 'SHIPPED': return <span className="badge bg-indigo text-white" style={{ backgroundColor: '#6610f2' }}>SHIPPED</span>;
      case 'DELIVERED': return <span className="badge bg-success">DELIVERED</span>;
      case 'CANCELLED': return <span className="badge bg-danger">CANCELLED</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Filters
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const activeOrders = orders.filter(o => ['CONFIRMED', 'PROCESSING'].includes(o.status)).length;
  const totalValue = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const totals = calculateTotals();

  return (
    <div>
      {/* Top Banner & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Sales Order Management</h2>
          <p className="text-muted mb-0">Manage customer sales orders, tax calculations, status lifecycles, and BOM material generation.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Create Sales Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Orders</div>
            <div className="fs-3 fw-bold text-dark">{totalOrders}</div>
            <div className="text-primary small mt-1"><i className="bi bi-cart me-1"></i> Lifetime volume</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-warning border-4">
            <div className="text-muted small text-uppercase fw-semibold">Pending Approval</div>
            <div className="fs-3 fw-bold text-dark">{pendingOrders}</div>
            <div className="text-warning small mt-1"><i className="bi bi-clock-history me-1"></i> Requires confirmation</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-info border-4">
            <div className="text-muted small text-uppercase fw-semibold">In Processing</div>
            <div className="fs-3 fw-bold text-dark">{activeOrders}</div>
            <div className="text-info small mt-1"><i className="bi bi-gear-wide me-1"></i> On factory floor</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Order Book (INR)</div>
            <div className="fs-3 fw-bold text-success">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-success small mt-1"><i className="bi bi-currency-rupee me-1"></i> Gross revenue potential</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by Order # or Customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex justify-content-md-end flex-wrap gap-1">
              {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
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

      {/* Sales Orders Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Order Number</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Expected Delivery</th>
                  <th>Status</th>
                  <th className="text-end">Grand Total</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No sales orders found matching your criteria.</td></tr>
                ) : (
                  filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td className="ps-3 fw-bold text-primary font-monospace">{o.orderNumber}</td>
                      <td>
                        <div className="fw-semibold">{o.customerName}</div>
                        <small className="text-muted">{o.customerCode}</small>
                      </td>
                      <td>{o.orderDate}</td>
                      <td>{o.expectedDeliveryDate || <span className="text-muted">-</span>}</td>
                      <td>{getStatusBadge(o.status)}</td>
                      <td className="text-end fw-bold">₹{Number(o.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" title="View Order Details" onClick={() => handleViewOrder(o)}>
                            <i className="bi bi-eye"></i> Details
                          </button>
                          <button className="btn btn-outline-success" title="Run BOM Explosion" onClick={() => handleRunBOMExplosion(o.id)}>
                            <i className="bi bi-diagram-3"></i> BOM
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          ></button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li><h6 className="dropdown-header">Change Status</h6></li>
                            {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
                              <li key={st}>
                                <button className="dropdown-item" onClick={() => handleUpdateStatus(o.id, st)} disabled={o.status === st}>
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

      {/* CREATE SALES ORDER MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-cart-plus me-2"></i>Create New Sales Order</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrder}>
                <div className="modal-body p-4">
                  {/* Order Header Fields */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Customer *</label>
                      <select
                        className="form-select"
                        required
                        value={newOrder.customerId}
                        onChange={e => setNewOrder({ ...newOrder, customerId: e.target.value })}
                      >
                        <option value="">Select Customer...</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.customerCode} - {c.companyName} ({c.city}, {c.state})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Expected Delivery Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newOrder.expectedDeliveryDate}
                        onChange={e => setNewOrder({ ...newOrder, expectedDeliveryDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Discount (INR)</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={newOrder.discountAmount}
                          onChange={e => setNewOrder({ ...newOrder, discountAmount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Order Notes / Specifications</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Requires test certification, dispatch to Plant II"
                        value={newOrder.notes}
                        onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Line Items Builder */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-uppercase text-muted mb-0">Order Line Items</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddItemRow}>
                      <i className="bi bi-plus me-1"></i> Add Product Item
                    </button>
                  </div>

                  <div className="table-responsive border rounded mb-3">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40%' }}>Finished Product *</th>
                          <th style={{ width: '15%' }}>Quantity *</th>
                          <th style={{ width: '20%' }}>Unit Price (INR)</th>
                          <th style={{ width: '10%' }}>GST %</th>
                          <th style={{ width: '15%' }} className="text-end">Line Total (Inc. GST)</th>
                          <th style={{ width: '5%' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newOrder.items.map((item, idx) => {
                          const qty = Number(item.quantity) || 0;
                          const price = Number(item.unitPrice) || 0;
                          const gst = Number(item.gstRate) || 18;
                          const lineSub = qty * price;
                          const lineTax = lineSub * (gst / 100);
                          const lineTot = lineSub + lineTax;

                          return (
                            <tr key={idx}>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  required
                                  value={item.productId}
                                  onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                                >
                                  <option value="">Select Manufactured Product...</option>
                                  {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.productCode} - {p.name} (Stock: {p.currentStock})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  className="form-control form-control-sm"
                                  value={item.quantity}
                                  onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
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
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.gstRate}
                                  onChange={e => handleItemChange(idx, 'gstRate', e.target.value)}
                                />
                              </td>
                              <td className="text-end fw-bold">
                                ₹{lineTot.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="text-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-danger p-0"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  disabled={newOrder.items.length === 1}
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

                  {/* Order Summary Card */}
                  <div className="row justify-content-end">
                    <div className="col-md-5">
                      <div className="card bg-light border-0 p-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Subtotal:</span>
                          <span className="fw-semibold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">GST Tax (18%):</span>
                          <span className="fw-semibold">₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Discount:</span>
                          <span className="text-danger">- ₹{totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Generate Sales Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {showDetailModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">Order Details: {selectedOrder.orderNumber}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="text-muted small">Customer Name</div>
                    <div className="fs-5 fw-bold text-dark">{selectedOrder.customerName}</div>
                    <div className="small text-muted">{selectedOrder.customerCode}</div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-muted small">Order Date</div>
                    <div className="fw-semibold">{selectedOrder.orderDate}</div>
                    <div className="text-muted small mt-2">Expected Delivery</div>
                    <div className="fw-semibold">{selectedOrder.expectedDeliveryDate || 'N/A'}</div>
                  </div>
                  <div className="col-md-3 text-md-end">
                    <div className="text-muted small">Current Status</div>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    <div className="text-muted small mt-2">Created By</div>
                    <div className="small fw-semibold">{selectedOrder.createdByName}</div>
                  </div>
                </div>

                <h6 className="fw-bold text-uppercase text-muted mb-2">Itemized Products</h6>
                <div className="table-responsive border rounded mb-3">
                  <table className="table align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Tax (GST)</th>
                        <th className="text-end">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map(it => (
                        <tr key={it.id}>
                          <td>
                            <div className="fw-semibold">{it.productName}</div>
                            <small className="text-muted">{it.productCode}</small>
                          </td>
                          <td className="text-center fw-bold">{it.quantity}</td>
                          <td className="text-end">₹{Number(it.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="text-end text-muted">₹{Number(it.lineTax).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({it.gstRate}%)</td>
                          <td className="text-end fw-bold">₹{Number(it.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Subtotal:</td>
                        <td className="text-end fw-bold">₹{Number(selectedOrder.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Total GST (18%):</td>
                        <td className="text-end fw-bold">₹{Number(selectedOrder.taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      {Number(selectedOrder.discountAmount) > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end fw-bold text-danger">Discount:</td>
                          <td className="text-end fw-bold text-danger">- ₹{Number(selectedOrder.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      <tr className="table-primary">
                        <td colSpan="4" className="text-end fw-bold fs-6">Grand Total:</td>
                        <td className="text-end fw-bold fs-6 text-primary">₹{Number(selectedOrder.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <div className="alert alert-light border small">
                    <strong>Notes:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRunBOMExplosion(selectedOrder.id);
                  }}
                >
                  <i className="bi bi-diagram-3 me-2"></i>Run BOM Explosion for Order
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOM EXPLOSION MODAL */}
      {showExplosionModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-diagram-3 text-warning me-2"></i>
                  Automated BOM Explosion Analysis
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowExplosionModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {explosionLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <div className="mt-2 text-muted">Calculating component formulas with scrap allowance...</div>
                  </div>
                ) : bomExplosion ? (
                  <div>
                    {/* Header info */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-3">
                        <div className="card border-0 bg-light p-3">
                          <small className="text-muted">Target Sales Order</small>
                          <div className="fw-bold fs-5 text-primary">{bomExplosion.orderNumber}</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card border-0 bg-light p-3">
                          <small className="text-muted">Total Finished Units</small>
                          <div className="fw-bold fs-5 text-dark">{bomExplosion.orderQuantity} Units</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card border-0 bg-light p-3">
                          <small className="text-muted">Components Analyzed</small>
                          <div className="fw-bold fs-5 text-info">{bomExplosion.totalMaterialsNeeded} Materials</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className={`card border-0 p-3 ${bomExplosion.shortfallMaterialsCount > 0 ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                          <small className="opacity-75">Material Shortfall</small>
                          <div className="fw-bold fs-5">
                            {bomExplosion.shortfallMaterialsCount > 0 ? `${bomExplosion.shortfallMaterialsCount} SHORTFALLS` : 'ALL IN STOCK'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Requirements Breakdown Table */}
                    <h6 className="fw-bold text-uppercase text-muted mb-2">Raw Material Explosion & Stock Check</h6>
                    <div className="table-responsive border rounded mb-3">
                      <table className="table align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Material Code</th>
                            <th>Material Name</th>
                            <th>Category</th>
                            <th className="text-end">Gross Req.</th>
                            <th className="text-end">Scrap Buffer</th>
                            <th className="text-end">Total Needed</th>
                            <th className="text-end">Current Stock</th>
                            <th className="text-center">Status</th>
                            <th className="text-end">Shortfall</th>
                            <th className="text-end">Shortfall Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bomExplosion.requirements?.map((req, idx) => (
                            <tr key={idx} className={req.status === 'SHORTFALL' ? 'table-warning' : ''}>
                              <td className="fw-bold font-monospace">{req.materialCode}</td>
                              <td>{req.materialName}</td>
                              <td><span className="badge bg-light text-dark border">{req.category}</span></td>
                              <td className="text-end">{req.grossRequired} {req.uom}</td>
                              <td className="text-end text-muted">+{req.scrapBuffer}</td>
                              <td className="text-end fw-bold">{req.totalRequired} {req.uom}</td>
                              <td className="text-end">{req.currentStock} {req.uom}</td>
                              <td className="text-center">
                                {req.status === 'SUFFICIENT' ? (
                                  <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>SUFFICIENT</span>
                                ) : (
                                  <span className="badge bg-danger"><i className="bi bi-exclamation-triangle me-1"></i>SHORTFALL</span>
                                )}
                              </td>
                              <td className="text-end fw-bold text-danger">
                                {Number(req.shortfall) > 0 ? `${req.shortfall} ${req.uom}` : '-'}
                              </td>
                              <td className="text-end fw-bold">
                                {Number(req.shortfallCost) > 0 ? `₹${Number(req.shortfallCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan="9" className="text-end fw-bold fs-6">Estimated Shortfall Procurement Cost:</td>
                            <td className="text-end fw-bold fs-6 text-danger">
                              ₹{Number(bomExplosion.totalShortfallCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {bomExplosion.shortfallMaterialsCount > 0 && (
                      <div className="alert alert-warning d-flex align-items-center justify-content-between mb-0">
                        <div>
                          <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
                          Warehouse inventory does not have enough raw materials to produce this order. Please issue a Purchase Order to replenish shortfall materials.
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExplosionModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
