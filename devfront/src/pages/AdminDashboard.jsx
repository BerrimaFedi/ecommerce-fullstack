import React, { useContext } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  Layers,
  Users,
  Truck,
  CreditCard,
  MessageCircle,
  LogOut,
} from 'lucide-react';
import '../admin/AdminStyles.css';

const navLinks = [
  { label: 'Dashboard', path: 'dashboard', icon: LayoutDashboard },
  { label: 'Products', path: 'products', icon: Box },
  { label: 'Categories', path: 'categories', icon: Layers },
  { label: 'Clients', path: 'clients', icon: Users },
  { label: 'Orders / Deliveries', path: 'orders', icon: Truck },
  { label: 'Payments', path: 'payments', icon: CreditCard },
  { label: 'Reviews', path: 'reviews', icon: MessageCircle },
];

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.replace('/admin/', '') || 'dashboard';
  const currentItem = navLinks.find((item) => item.path === currentPath) || navLinks[0];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Box size={28} />
          <span>LuxeCart</span>
        </div>

        <nav className="admin-sidebar-nav">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              className={({ isActive }) => `admin-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-logout" onClick={handleLogout}>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)' }}>Administrator</div>
            </div>
            <LogOut size={18} />
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title">
            <h1>{currentItem.label}</h1>
            <span>Welcome back, {user?.firstName || 'Admin'}. Manage LuxeCart securely.</span>
          </div>
          <div className="admin-user-chip">
            <div className="admin-avatar-placeholder">{user?.firstName?.[0] || 'A'}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{user?.email}</div>
            </div>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
