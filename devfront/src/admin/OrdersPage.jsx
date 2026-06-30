import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import api from '../api';

const statusOptions = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusClass = (status) => `status-pill status-${status.toLowerCase()}`;
const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const OrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          api.get('/commandes/all'),
          api.get('/admin/payments'),
        ]);
        setOrders(ordersRes.data || []);
        setPayments(paymentsRes.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load orders.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshOrders = async () => {
    const [ordersRes, paymentsRes] = await Promise.all([api.get('/commandes/all'), api.get('/admin/payments')]);
    setOrders(ordersRes.data || []);
    setPayments(paymentsRes.data || []);
  };

  const paymentMap = useMemo(() => {
    return payments.reduce((acc, payment) => {
      acc[payment.commandeId] = payment;
      return acc;
    }, {});
  }, [payments]);

  const visibleOrders = useMemo(() => orders.filter((order) => filterStatus === 'ALL' || order.status === filterStatus), [orders, filterStatus]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/commandes/${orderId}/status?status=${status}`);
      await refreshOrders();
    } catch (err) {
      console.error(err);
      setError('Failed to update order status.');
    }
  };

  const processPayment = async (orderId) => {
    try {
      await api.post(`/commandes/${orderId}/process`);
      await refreshOrders();
    } catch (err) {
      console.error(err);
      setError('Failed to process payment.');
    }
  };

  if (loading) return <div className="admin-table-card">Loading orders...</div>;

  return (
    <div className="admin-content">
      <div className="admin-table-card">
        <div className="table-actions">
          <div>
            <h3>Orders & Deliveries</h3>
            <p className="admin-muted">Filter and manage order delivery status quickly.</p>
          </div>
          <div className="filter-bar">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Client</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.commandeId} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                <td>#{order.commandeId}</td>
                <td>{order.user?.email}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td><span className={statusClass(order.status)}>{order.status}</span></td>
                <td><ChevronDown size={18} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="admin-panel admin-table-card" style={{ marginTop: '1.5rem' }}>
          <div className="table-actions">
            <div>
              <h3>Order #{selectedOrder.commandeId}</h3>
              <p className="admin-muted">Shipping address and item details.</p>
            </div>
            <button type="button" className="admin-button small" onClick={() => setSelectedOrder(null)}>
              Close
            </button>
          </div>
          <div className="order-details admin-panel">
            <div>
              <strong>Client</strong>
              <p>{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
              <p>{selectedOrder.user?.email}</p>
            </div>
            <div>
              <strong>Payment Status</strong>
              <p>{paymentMap[selectedOrder.commandeId]?.status || 'Not available'}</p>
              {!paymentMap[selectedOrder.commandeId] && selectedOrder.status !== 'CANCELLED' && (
                <button type="button" className="btn btn-primary btn-small" onClick={() => processPayment(selectedOrder.commandeId)}>
                  Process payment
                </button>
              )}
            </div>
            <div>
              <strong>Order Total</strong>
              <p>{formatCurrency(selectedOrder.totalAmount)}</p>
            </div>
            <div>
              <strong>Shipping Address</strong>
              <p>{selectedOrder.shippingAddress}</p>
            </div>
            <div>
              <strong>Delivery Status</strong>
              <select value={selectedOrder.status} onChange={(e) => updateStatus(selectedOrder.commandeId, e.target.value)}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="admin-panel" style={{ marginTop: '1rem' }}>
            <h4>Ordered Items</h4>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.commandeItemId}>
                    <td>{item.product?.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <div className="admin-table-card">{error}</div>}
    </div>
  );
};

export default OrdersPage;
