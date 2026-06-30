import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, loading, removeFromCart, clearCart, updateCartItemQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  if (loading) return <div className="text-center mt-4">Loading Cart...</div>;

  const items = cartItems || [];
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container" style={{ margin: '4rem auto' }}>
      <div className="page-header" style={{ textAlign: 'left', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--accent-primary)', fontWeight: '600', textTransform: 'uppercase' }}>Your Cart</p>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>Ready for checkout.</h1>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Explore LuxeCart’s featured collection to add something special.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Shop Products
          </button>
        </div>
      ) : (
        <div className="checkout-container">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <div className="qty-controls" style={{ width: 'fit-content', marginTop: '1rem' }}>
                    <button onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="qty-btn">-</button>
                    <span style={{ margin: '0 0.5rem' }}>{item.quantity}</span>
                    <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                  <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="btn-icon">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h3 style={{ marginBottom: '1.5rem' }}>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%' }}>
                Checkout <ArrowRight size={16} />
              </button>
              <button onClick={clearCart} className="btn btn-secondary" style={{ width: '100%' }}>
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
