import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import api from '../api';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const ClientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await api.get('/admin/users');
        setClients(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load clients.');
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const openClient = async (client) => {
    setSelectedClient(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/users/${client.userId}`);
      setSelectedClient(response.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load client details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredClients = useMemo(() => clients.filter((client) =>
    [client.firstName, client.lastName, client.email].some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase()),
    ),
  ), [clients, search]);

  if (loading) {
    return <div className="admin-table-card">Loading clients...</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-table-card">
        <div className="table-actions">
          <div>
            <h3>Clients</h3>
            <p className="admin-muted">Browse customer accounts, order history, and reviews.</p>
          </div>
        </div>
        <div className="table-search">
          <Search size={16} />
          <input value={search} placeholder="Search clients..." onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.userId} style={{ cursor: 'pointer' }} onClick={() => openClient(client)}>
                <td>{client.firstName} {client.lastName}</td>
                <td>{client.email}</td>
                <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                <td>{client.totalOrders}</td>
                <td>{formatCurrency(client.totalSpent)}</td>
                <td><button className="admin-button small" type="button">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClient && (
        <div className="admin-panel admin-table-card" style={{ marginTop: '1.5rem' }}>
          <div className="admin-panel">
            <div className="table-actions">
              <div>
                <h3>{selectedClient.firstName} {selectedClient.lastName}</h3>
                <p className="admin-muted">{selectedClient.email}</p>
              </div>
              <button type="button" className="admin-button small" onClick={() => setSelectedClient(null)}>
                <X size={16} /> Close
              </button>
            </div>
            <div className="panel-grid">
              <div className="client-detail admin-panel">
                <h4>Personal Info</h4>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Joined:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                <p><strong>Total Orders:</strong> {selectedClient.totalOrders}</p>
                <p><strong>Total Spent:</strong> {formatCurrency(selectedClient.totalSpent)}</p>
              </div>
              <div className="client-detail admin-panel">
                <h4>Recent Reviews</h4>
                {selectedClient.reviews.length ? (
                  <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                    {selectedClient.reviews.slice(0, 5).map((review) => (
                      <li key={review.reviewId} style={{ marginBottom: '0.75rem' }}>
                        <strong>{review.productName}</strong> — {review.rating} ★
                        <p style={{ margin: '0.2rem 0 0' }}>{review.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-muted">No reviews yet.</p>
                )}
              </div>
            </div>
            <div className="admin-panel" style={{ marginTop: '1rem' }}>
              <h4>Order History</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClient.orders.length ? selectedClient.orders.map((order) => (
                    <tr key={order.commandeId}>
                      <td>#{order.commandeId}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4}>No orders for this client.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {detailLoading && <div className="admin-table-card">Loading client details...</div>}
      {error && <div className="admin-table-card">{error}</div>}
    </div>
  );
};

export default ClientsPage;
