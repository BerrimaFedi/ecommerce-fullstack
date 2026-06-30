import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/reviews/product/${id}`),
    ])
      .then(([productRes, reviewsRes]) => {
        setProduct(productRes.data);
        setReviews(reviewsRes.data || []);
      })
      .catch((error) => {
        console.error('Failed to load product', error);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', maxWidth: '700px', margin: '2rem auto' }}>
        <h2>Loading product…</h2>
      </div>
    );
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError(null);

    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim() || rating < 1 || rating > 5) {
      setReviewError('Please add a rating and a comment.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post('/reviews', {
        productId: product.productId,
        rating,
        comment: comment.trim(),
      });
      setComment('');
      setRating(5);
      setReviews((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error('Unable to submit review', error);
      setReviewError('Unable to submit review.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="card" style={{ padding: '2rem', maxWidth: '700px', margin: '2rem auto' }}>
        <h2>Product not found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button className="btn btn-outline back-button" onClick={() => navigate('/products')}>
        <ArrowLeft size={18} /> Back to shop
      </button>
      <div className="product-detail-grid card">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/900x700?text=Product'}
          alt={product.name}
          className="detail-image"
        />
        <div className="detail-copy">
          <span className="pill detail-category">{product.category?.name || 'Uncategorized'}</span>
          <h1>{product.name}</h1>
          <p className="product-rating">Premium selection</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-footer">
            <div>
              <p className="text-secondary">Starting at</p>
              <p className="price detail-price">${product.price.toFixed(2)}</p>
            </div>
            <div className="product-quantity-group">
              <label htmlFor="quantity" className="form-label">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="quantity-input"
              />
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={() => addToCart(product, quantity)}
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
      <div className="review-section card">
        <div className="review-list">
          <h2>Customer reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-secondary">No approved reviews yet. Be the first to leave feedback.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.reviewId} className="review-list-item">
                <div className="review-list-header">
                  <strong>{review.userName}</strong>
                  <div className="review-stars">{'★'.repeat(review.rating)}</div>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          )}
        </div>

        <div className="review-form">
          <h2>Leave a review</h2>
          <p className="text-secondary">Share your experience and help other customers find the right item.</p>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-control">
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} stars</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                className="form-control"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what you loved about this product..."
              />
            </div>
            {reviewError && <p className="form-error">{reviewError}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
