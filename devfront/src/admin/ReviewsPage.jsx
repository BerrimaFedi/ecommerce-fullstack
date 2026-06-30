import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import api from '../api';

const statusClass = (status) => `status-pill status-${String(status || '').toLowerCase()}`;

const ReviewsPage = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/admin/reviews');
        setReviews(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateReview = async (reviewId, status) => {
    try {
      await api.put(`/admin/reviews/${reviewId}/status?status=${status}`);
      setReviews((prev) => prev.map((review) => review.reviewId === reviewId ? { ...review, status } : review));
    } catch (err) {
      console.error(err);
      setError('Unable to update review status.');
    }
  };

  const removeReview = async (reviewId) => {
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((review) => review.reviewId !== reviewId));
    } catch (err) {
      console.error(err);
      setError('Unable to delete review.');
    }
  };

  const filtered = reviews.filter((review) =>
    [review.productName, review.clientEmail, review.rating, review.comment, review.status]
      .some((value) => String(value).toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) return <div className="admin-table-card">Loading reviews...</div>;

  return (
    <div className="admin-content">
      <div className="admin-table-card">
        <div className="table-actions">
          <div>
            <h3>Reviews</h3>
            <p className="admin-muted">Approve, reject, or remove customer reviews.</p>
          </div>
        </div>
        <div className="table-search">
          <input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Client</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((review) => (
              <tr key={review.reviewId}>
                <td>{review.productName}</td>
                <td>{review.clientEmail}</td>
                <td>{'★'.repeat(review.rating)}</td>
                <td>{review.comment}</td>
                <td><span className={statusClass(review.status)}>{review.status}</span></td>
                <td>
                  <div className="table-toolbar">
                    <button className="admin-button small" type="button" onClick={() => updateReview(review.reviewId, 'APPROVED')}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button className="admin-button small secondary" type="button" onClick={() => updateReview(review.reviewId, 'REJECTED')}>
                      <XCircle size={14} /> Reject
                    </button>
                    <button className="admin-button small secondary" type="button" onClick={() => removeReview(review.reviewId)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className="admin-table-card">{error}</div>}
    </div>
  );
};

export default ReviewsPage;
