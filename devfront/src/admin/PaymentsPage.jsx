import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
const statusClass = (status) => `status-pill status-${String(status || '').toLowerCase()}`;

const PaymentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/admin/payments');
        setPayments(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load payments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totals = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        acc.collected += Number(payment.amount || 0);
        if (payment.status === 'PENDING') acc.pending += Number(payment.amount || 0);
        if (payment.status === 'FAILED') acc.failed += Number(payment.amount || 0);
        return acc;
      },
      { collected: 0, pending: 0, failed: 0 },
    );
  }, [payments]);

  const filtered = payments.filter((payment) =>
    [payment.paymentId, payment.commandeId, payment.clientEmail, payment.paymentMethod, payment.status]
      .some((value) => String(value).toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) return <div className="admin-table-card">Loading payments...</div>;

  return (
    <div className="admin-content">
      <div className="admin-grid">
        <div className="admin-card kpi-card">
          <h3>Total Collected</h3>
          <strong>{formatCurrency(totals.collected)}</strong>
        </div>
        <div className="admin-card kpi-card">
          <h3>Pending</h3>
          <strong>{formatCurrency(totals.pending)}</strong>
        </div>
        <div className="admin-card kpi-card">
          <h3>Failed</h3>
          <strong>{formatCurrency(totals.failed)}</strong>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="table-actions">
          <div>
            <h3>Payments</h3>
            <p className="admin-muted">Review payment status across orders.</p>
          </div>
        </div>
        <div className="table-search">
          <input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Order</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.paymentId}>
                  <td>#{payment.paymentId}</td>
                  <td>#{payment.commandeId}</td>
                  <td>{payment.clientEmail}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.paymentMethod}</td>
                  <td><span className={statusClass(payment.status)}>{payment.status}</span></td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-panel">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p className="admin-muted">No payments found yet.</p>
            </div>
          </div>
        )}
      </div>
      {error && <div className="admin-table-card">{error}</div>}
    </div>
  );
};

export default PaymentsPage;
