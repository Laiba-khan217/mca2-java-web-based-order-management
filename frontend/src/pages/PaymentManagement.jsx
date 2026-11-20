import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    invoiceId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMode: 'NEFT',
    transactionReference: '',
    remarks: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      setPayments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    }
  };

  const handleInvoiceChange = (invId) => {
    const inv = invoices.find(i => i.id === Number(invId));
    setNewPayment({
      ...newPayment,
      invoiceId: invId,
      amount: inv ? inv.balanceDue : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPayment.invoiceId || !newPayment.amount || !newPayment.transactionReference) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      await api.post('/payments', {
        invoiceId: Number(newPayment.invoiceId),
        paymentDate: newPayment.paymentDate,
        amount: Number(newPayment.amount),
        paymentMode: newPayment.paymentMode,
        transactionReference: newPayment.transactionReference,
        remarks: newPayment.remarks
      });
      alert('Payment recorded successfully! Invoice balance has been updated.');
      setShowModal(false);
      setNewPayment({
        invoiceId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMode: 'NEFT',
        transactionReference: '',
        remarks: ''
      });
      fetchPayments();
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const filteredPayments = payments.filter(p => {
    return p.paymentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.transactionReference?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Customer Payment Management</h2>
          <p className="text-muted mb-0">Record payments against tax invoices via NEFT, RTGS, UPI, and cheques with automatic balance due reconciliation.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowModal(true)}>
          <i className="bi bi-cash-coin me-2"></i>
          Record Payment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 border-start border-success border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Collections (INR)</div>
            <div className="fs-3 fw-bold text-success">₹{totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-success small mt-1"><i className="bi bi-bank me-1"></i> Deposited into company accounts</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 border-start border-primary border-4">
            <div className="text-muted small text-uppercase fw-semibold">Total Transactions</div>
            <div className="fs-3 fw-bold text-dark">{payments.length}</div>
            <div className="text-primary small mt-1"><i className="bi bi-receipt me-1"></i> Recorded remittances</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 border-start border-info border-4">
            <div className="text-muted small text-uppercase fw-semibold">Average Receipt Value</div>
            <div className="fs-3 fw-bold text-dark">
              ₹{(payments.length ? totalCollected / payments.length : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-info small mt-1"><i className="bi bi-graph-up me-1"></i> Per settlement transaction</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by Payment #, Invoice #, Customer, or UTR/Cheque Ref..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Payment Number</th>
                  <th>Invoice Ref</th>
                  <th>Customer</th>
                  <th>Payment Date</th>
                  <th>Mode</th>
                  <th>Transaction Ref / UTR</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">Loading payments...</td></tr>
                ) : filteredPayments.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No payments recorded.</td></tr>
                ) : (
                  filteredPayments.map(p => (
                    <tr key={p.id}>
                      <td className="ps-3 fw-bold text-primary font-monospace">{p.paymentNumber}</td>
                      <td><span className="badge bg-light text-dark border">{p.invoiceNumber}</span></td>
                      <td className="fw-semibold">{p.customerName}</td>
                      <td>{p.paymentDate}</td>
                      <td><span className="badge bg-dark">{p.paymentMode}</span></td>
                      <td className="font-monospace small text-muted">{p.transactionReference}</td>
                      <td className="text-end fw-bold text-success">₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td><span className="badge bg-success">{p.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-cash-stack me-2"></i>Record Customer Payment</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Target Invoice *</label>
                    <select
                      className="form-select"
                      required
                      value={newPayment.invoiceId}
                      onChange={e => handleInvoiceChange(e.target.value)}
                    >
                      <option value="">Select Invoice with Balance Due...</option>
                      {invoices.filter(i => Number(i.balanceDue) > 0).map(i => (
                        <option key={i.id} value={i.id}>
                          {i.invoiceNumber} - {i.customerName} (Due: ₹{Number(i.balanceDue).toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Payment Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={newPayment.paymentDate}
                        onChange={e => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Payment Amount (INR) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        className="form-control fw-bold"
                        value={newPayment.amount}
                        onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Payment Mode *</label>
                      <select
                        className="form-select"
                        required
                        value={newPayment.paymentMode}
                        onChange={e => setNewPayment({ ...newPayment, paymentMode: e.target.value })}
                      >
                        <option value="NEFT">NEFT</option>
                        <option value="RTGS">RTGS</option>
                        <option value="UPI">UPI</option>
                        <option value="CHEQUE">CHEQUE</option>
                        <option value="BANK_TRANSFER">BANK TRANSFER</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">UTR / Cheque Ref *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. UTR / Cheque Number"
                        value={newPayment.transactionReference}
                        onChange={e => setNewPayment({ ...newPayment, transactionReference: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Remarks</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. First tranche milestone remittance"
                      value={newPayment.remarks}
                      onChange={e => setNewPayment({ ...newPayment, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 fw-bold">Record Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
