import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Checkout = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { createOrder, cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0 || !address.trim()) {
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder(address.trim());
      if (order) {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Finalize your LuxeCart order.</h1>
        </div>
      </div>

      <div className="card checkout-card">
        <h2>Shipping information</h2>
        <p className="text-secondary">Enter where you want your premium order delivered.</p>

        <form onSubmit={handleCheckout}>
          <div className="form-group">
            <label className="form-label">Shipping Address</label>
            <textarea
              className="form-control"
              rows="4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Luxe Avenue, Suite 9, Paris, FR"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !address.trim()}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
