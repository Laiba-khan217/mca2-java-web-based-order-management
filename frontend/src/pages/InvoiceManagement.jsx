import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Generate Invoice Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Tax Invoice Print Preview Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/sales-orders');
      setSalesOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch sales orders', err);
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select a Sales Order');
      return;
    }

    try {
      await api.post('/invoices', {
        salesOrderId: Number(selectedOrderId),
        dueDate: dueDate || null
      });
      setShowGenerateModal(false);
      setSelectedOrderId('');
      setDueDate('');
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleOpenPreview = (inv) => {
    setSelectedInvoice(inv);
    setShowPreviewModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ISSUED': return <span className="badge bg-primary">ISSUED</span>;
      case 'PARTIALLY_PAID': return <span className="badge bg-warning text-dark">PARTIALLY PAID</span>;
      case 'PAID': return <span className="badge bg-success">PAID</span>;
      case 'OVERDUE': return <span className="badge bg-danger">OVERDUE</span>;
      case 'CANCELLED': return <span className="badge bg-secondary">CANCELLED</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.salesOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalBalanceDue = invoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);
  const paidCount = invoices.filter(i => i.status === 'PAID').length;
  const pendingCount = invoices.filter(i => ['ISSUED', 'PARTIALLY_PAID'].includes(i.status)).length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">GST Tax Invoices</h2>
          <p className="text-muted mb-0">Generate standard GST-compliant tax invoices from confirmed sales orders with automatic CGST, SGST, and IGST breakdowns.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowGenerateModal(true)}>
          <i className="bi bi-file-earmark-plus me-2"></i>
          Generate Tax Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Invoiced (INR)</div>
            <div className="fs-3 fw-bold text-dark">₹{totalInvoiced.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-primary small mt-1"><i className="bi bi-receipt me-1"></i> Cumulative billed</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-danger border-4">
            <div className="text-muted small text-uppercase fw-semibold">Outstanding Receivables</div>
            <div className="fs-3 fw-bold text-danger">₹{totalBalanceDue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-danger small mt-1"><i className="bi bi-exclamation-circle me-1"></i> Unpaid balance due</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
            <div className="text-muted small text-uppercase fw-semibold">Fully Paid Invoices</div>
            <div className="fs-3 fw-bold text-success">{paidCount}</div>
            <div className="text-success small mt-1"><i className="bi bi-check-circle me-1"></i> Settled in full</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 border-start border-warning border-4">
            <div className="text-muted small text-uppercase fw-semibold">Awaiting Payment</div>
            <div className="fs-3 fw-bold text-warning">{pendingCount}</div>
            <div className="text-warning small mt-1"><i className="bi bi-clock-history me-1"></i> Issued / Partial</div>
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
                  placeholder="Search by Invoice #, Order # or Customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-7 d-flex justify-content-md-end flex-wrap gap-1">
              {['ALL', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'].map(st => (
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
                  <th className="ps-3">Invoice Number</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th className="text-end">Grand Total</th>
                  <th className="text-end">Balance Due</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="text-center py-4 text-muted">Loading invoices...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-4 text-muted">No invoices found.</td></tr>
                ) : (
                  filteredInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="ps-3 fw-bold text-primary font-monospace">{inv.invoiceNumber}</td>
                      <td><span className="badge bg-light text-dark border">{inv.salesOrderNumber}</span></td>
                      <td>
                        <div className="fw-semibold">{inv.customerName}</div>
                        <small className="text-muted">{inv.customerGstin || 'Unregistered'}</small>
                      </td>
                      <td>{inv.invoiceDate}</td>
                      <td>{inv.dueDate}</td>
                      <td>{getStatusBadge(inv.status)}</td>
                      <td className="text-end fw-bold">₹{Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-end fw-bold text-danger">₹{Number(inv.balanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-dark" onClick={() => handleOpenPreview(inv)}>
                          <i className="bi bi-printer me-1"></i> Print / Preview
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

      {/* GENERATE INVOICE MODAL */}
      {showGenerateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-receipt me-2"></i>Generate GST Invoice</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowGenerateModal(false)}></button>
              </div>
              <form onSubmit={handleGenerateInvoice}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Sales Order *</label>
                    <select
                      className="form-select"
                      required
                      value={selectedOrderId}
                      onChange={e => setSelectedOrderId(e.target.value)}
                    >
                      <option value="">Choose confirmed sales order...</option>
                      {salesOrders.map(so => (
                        <option key={so.id} value={so.id}>
                          {so.orderNumber} - {so.customerName} (₹{Number(so.grandTotal).toLocaleString('en-IN')} | {so.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                    <small className="text-muted">Defaults to 30 days credit from invoice date if empty.</small>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Generate Invoice</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AUTHENTIC INDIAN GST TAX INVOICE PREVIEW / PRINT MODAL */}
      {showPreviewModal && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white d-print-none">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-text text-warning me-2"></i>
                  Tax Invoice Preview: {selectedInvoice.invoiceNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPreviewModal(false)}></button>
              </div>
              <div className="modal-body p-5 bg-white text-dark printable-invoice">
                {/* Header */}
                <div className="border-bottom pb-4 mb-4">
                  <div className="row align-items-center">
                    <div className="col-8">
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-gear-wide-connected fs-2 text-warning me-2"></i>
                        <h2 className="fw-bold mb-0 text-dark">Apex Manufacturing Pvt. Ltd.</h2>
                      </div>
                      <p className="text-muted small mb-0">Plot 45-48, Chakan Industrial Phase II, MIDC, Pune, Maharashtra - 410501</p>
                      <p className="small mb-0"><strong>CIN:</strong> U29253PN2015PTC154201 | <strong>GSTIN:</strong> 27AAACA1234F1Z5 | <strong>State:</strong> Maharashtra (Code: 27)</p>
                      <p className="small mb-0"><strong>Email:</strong> accounts@apexmanufacturing.in | <strong>Phone:</strong> +91 20 6712 3456</p>
                    </div>
                    <div className="col-4 text-end">
                      <div className="badge bg-dark fs-6 text-uppercase px-3 py-2 mb-2">TAX INVOICE</div>
                      <div className="font-monospace fs-5 fw-bold text-primary">{selectedInvoice.invoiceNumber}</div>
                      <div className="small text-muted">Original for Recipient</div>
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="row g-4 mb-4">
                  <div className="col-6">
                    <div className="card h-100 border p-3 bg-light">
                      <h6 className="fw-bold text-uppercase border-bottom pb-2 mb-2">Billed To (Customer Details)</h6>
                      <div className="fw-bold fs-6">{selectedInvoice.customerName}</div>
                      <div className="small text-muted">{selectedInvoice.billingAddress}</div>
                      <div className="small mt-2"><strong>GSTIN / UIN:</strong> {selectedInvoice.customerGstin || 'Unregistered'}</div>
                      <div className="small"><strong>State:</strong> {selectedInvoice.customerState || 'Maharashtra'}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card h-100 border p-3 bg-light">
                      <h6 className="fw-bold text-uppercase border-bottom pb-2 mb-2">Invoice Particulars</h6>
                      <div className="row small g-1">
                        <div className="col-6 text-muted">Invoice Date:</div>
                        <div className="col-6 fw-bold">{selectedInvoice.invoiceDate}</div>
                        <div className="col-6 text-muted">Payment Due Date:</div>
                        <div className="col-6 fw-bold text-danger">{selectedInvoice.dueDate}</div>
                        <div className="col-6 text-muted">Sales Order Ref:</div>
                        <div className="col-6 fw-bold font-monospace">{selectedInvoice.salesOrderNumber}</div>
                        <div className="col-6 text-muted">Payment Status:</div>
                        <div className="col-6">{getStatusBadge(selectedInvoice.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="table-responsive mb-4">
                  <table className="table table-bordered align-middle">
                    <thead className="table-secondary text-center small text-uppercase">
                      <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th style={{ width: '45%' }} className="text-start">Description of Goods</th>
                        <th style={{ width: '10%' }}>Qty</th>
                        <th style={{ width: '15%' }} className="text-end">Rate (INR)</th>
                        <th style={{ width: '10%' }} className="text-end">Tax (18%)</th>
                        <th style={{ width: '15%' }} className="text-end">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((it, idx) => (
                        <tr key={it.id}>
                          <td className="text-center">{idx + 1}</td>
                          <td>
                            <div className="fw-bold">{it.productName}</div>
                            <small className="text-muted font-monospace">{it.productCode}</small>
                          </td>
                          <td className="text-center fw-bold">{it.quantity}</td>
                          <td className="text-end">₹{Number(it.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="text-end">₹{Number(it.lineTax).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="text-end fw-bold">₹{Number(it.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">Subtotal:</td>
                        <td colSpan="2" className="text-end fw-bold">₹{Number(selectedInvoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      {Number(selectedInvoice.cgstAmount) > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end">Central GST (CGST 9%):</td>
                          <td colSpan="2" className="text-end">₹{Number(selectedInvoice.cgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      {Number(selectedInvoice.sgstAmount) > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end">State GST (SGST 9%):</td>
                          <td colSpan="2" className="text-end">₹{Number(selectedInvoice.sgstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      {Number(selectedInvoice.igstAmount) > 0 && (
                        <tr>
                          <td colSpan="4" className="text-end">Integrated GST (IGST 18%):</td>
                          <td colSpan="2" className="text-end">₹{Number(selectedInvoice.igstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      <tr className="table-dark text-white fs-6">
                        <td colSpan="4" className="text-end fw-bold">Total Invoice Amount (INR):</td>
                        <td colSpan="2" className="text-end fw-bold">₹{Number(selectedInvoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="table-warning text-dark">
                        <td colSpan="4" className="text-end fw-bold">Balance Due:</td>
                        <td colSpan="2" className="text-end fw-bold text-danger fs-6">₹{Number(selectedInvoice.balanceDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bank Details & Signature */}
                <div className="row g-4 pt-3 border-top">
                  <div className="col-7 small">
                    <h6 className="fw-bold mb-1">Company Bank Details for RTGS / NEFT:</h6>
                    <div><strong>Bank:</strong> HDFC Bank Ltd.</div>
                    <div><strong>A/C Name:</strong> Apex Manufacturing Pvt. Ltd.</div>
                    <div><strong>Current A/C No:</strong> 50200012345678</div>
                    <div><strong>IFSC Code:</strong> HDFC0001234</div>
                    <div><strong>Branch:</strong> Chakan Industrial Area, Pune</div>
                  </div>
                  <div className="col-5 text-end small">
                    <p className="mb-4">For <strong>Apex Manufacturing Pvt. Ltd.</strong></p>
                    <div className="pt-4 border-top d-inline-block text-center" style={{ width: '180px' }}>
                      <strong>Authorized Signatory</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light d-print-none">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handlePrint}>
                  <i className="bi bi-printer me-2"></i>Print Tax Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
