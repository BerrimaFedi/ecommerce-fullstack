import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, User, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartItemsCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <ShoppingCart size={24} />
          <span>LuxeCart</span>
        </Link>

      <div className="nav-links">
        <Link to="/products" className="nav-link">Shop</Link>
        <a href="#collections" className="nav-link">Collections</a>
        <a href="#about" className="nav-link">About</a>
        <a href="#contact" className="nav-link">Contact</a>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="nav-link">Admin</Link>
        )}
      </div>

      <div className="nav-actions">
        <Link to="/cart" className="btn-icon" style={{ textDecoration: 'none' }}>
          <ShoppingCart size={20} />
          {cartItemsCount > 0 && <span className="badge">{cartItemsCount}</span>}
        </Link>

        {user ? (
          <div className="avatar-menu">
            <button
              className="avatar-button"
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <User size={18} />
              <span className="avatar-name">{user.username?.split(' ')[0] || 'Me'}</span>
              <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="avatar-dropdown">
                <button className="dropdown-item" type="button">Account</button>
                <button className="dropdown-item" type="button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
