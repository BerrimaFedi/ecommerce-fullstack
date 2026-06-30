import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../api';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;
const getStatusClass = (status) => `status-pill status-${String(status || '').toLowerCase()}`;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/products'),
          api.get('/commandes/all'),
          api.get('/admin/users'),
        ]);
        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
        setClients(usersRes.data || []);
      } catch (err) {
        setError('Unable to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const revenueTotal = useMemo(() => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'PENDING').length, [orders]);
  const revenueSeries = useMemo(() => {
    const now = new Date();
    const bucket = Array.from({ length: 30 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (29 - index));
      return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), revenue: 0 };
    });

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const row = bucket.find((item) => item.date === orderDate);
      if (row) row.revenue += Number(order.totalAmount || 0);
    });

    return bucket;
  }, [orders]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [orders]);
  const lowStock = useMemo(() => products.filter((product) => Number(product.stockQuantity) <= 10), [products]);

  if (loading) {
    return <div className="admin-table-card">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="admin-table-card">{error}</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-grid">
        <div className="admin-card kpi-card">
          <div className="kpi-meta">
            <h3>Total Revenue</h3>
            <span className="admin-chip">Live</span>
          </div>
          <strong>{formatCurrency(revenueTotal)}</strong>
          <div className="kpi-trend">▲ 4.9% from last month</div>
        </div>
        <div className="admin-card kpi-card">
          <div className="kpi-meta">
            <h3>Total Orders</h3>
            <span className="admin-chip">Last 30d</span>
          </div>
          <strong>{orders.length}</strong>
          <div className="kpi-trend">▲ 12.7% growth</div>
        </div>
        <div className="admin-card kpi-card">
          <div className="kpi-meta">
            <h3>Total Clients</h3>
            <span className="admin-chip">Active</span>
          </div>
          <strong>{clients.length}</strong>
          <div className="kpi-trend">▲ 3.2% new users</div>
        </div>
        <div className="admin-card kpi-card">
          <div className="kpi-meta">
            <h3>Pending Deliveries</h3>
            <span className="admin-chip">Status</span>
          </div>
          <strong>{pendingOrders}</strong>
          <div className="kpi-trend">▼ 2.1% lower</div>
        </div>
      </div>

      <div className="admin-card admin-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="table-actions">
          <div>
            <h3>Revenue (Last 30 days)</h3>
            <p className="admin-muted">Track daily order value and find opportunities.</p>
          </div>
        </div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueSeries}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-table-card" style={{ gridColumn: 'span 2' }}>
          <h3>Recent Orders</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.commandeId}>
                  <td>#{order.commandeId}</td>
                  <td>{order.user?.email || 'Unknown'}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td><span className={getStatusClass(order.status)}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-table-card" style={{ gridColumn: 'span 2' }}>
          <h3>Low Stock Alerts</h3>
          {lowStock.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.name}</td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td><span className="admin-chip">{product.stockQuantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No low stock products at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
