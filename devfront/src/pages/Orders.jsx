import React, { useContext } from 'react';
import { Package } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const Orders = () => {
  const { orders, loading } = useContext(CartContext);

  if (loading) return <div className="text-center mt-4">Loading Orders...</div>;

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Order History</p>
          <h1>Your LuxeCart journey.</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card empty-state">
          <Package size={32} color="var(--accent)" />
          <h3>No orders yet</h3>
          <p>Complete a purchase to see your orders appear here.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="card order-card">
              <div className="order-header">
                <div>
                  <p className="text-secondary">Order #{order.id}</p>
                  <h3>{new Date(order.createdAt).toLocaleDateString()}</h3>
                </div>
                <span className={order.status === 'DELIVERED' ? 'status-pill delivered' : 'status-pill processing'}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p className="text-secondary">{order.items?.length || 0} items • ${Number(order.totalAmount).toFixed(2)}</p>
                <p className="order-address">Shipping to: {order.shippingAddress}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
