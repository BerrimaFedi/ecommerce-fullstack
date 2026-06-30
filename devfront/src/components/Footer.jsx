import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-grid">
        <div>
          <h3>LuxeCart</h3>
          <p>Minimal luxury shopping, designed for style and ease. Discover refined essentials with fast checkout and curated support.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p><MapPin size={16} /> 128 Style Avenue, Suite 12</p>
          <p><Phone size={16} /> +1 (555) 010-2345</p>
          <p><Mail size={16} /> hello@luxecart.com</p>
        </div>
        <div>
          <h4>Quick links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/cart">Cart</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} LuxeCart. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
