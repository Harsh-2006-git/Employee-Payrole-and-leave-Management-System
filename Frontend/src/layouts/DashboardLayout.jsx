import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  LogOut,
  Bell,
  Search,
  User as UserIcon,
  History,
  Settings,
  QrCode,
  ScanLine,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminMenu = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { title: 'Employees', path: '/employees', icon: <Users size={20} /> },
    { title: 'Leave Requests', path: '/leaves', icon: <CalendarDays size={20} /> },
    { title: 'Attendance', path: '/attendance-mgmt', icon: <Calendar size={18} /> },
    { title: 'Payroll', path: '/payroll', icon: <CreditCard size={20} /> },
    { title: 'QR Generator', path: '/admin-qr', icon: <QrCode size={20} /> },
    { title: 'System Templates', path: '/templates', icon: <Settings size={20} /> },
  ];

  const employeeMenu = [
    { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { title: 'Apply Leave', path: '/apply-leave', icon: <CalendarDays size={20} /> },
    { title: 'Leave History', path: '/leave-history', icon: <History size={20} /> },
    { title: 'Attendance', path: '/attendance', icon: <CalendarDays size={20} /> },
    { title: 'Financial History', path: '/my-history', icon: <CreditCard size={20} /> },
    { title: 'Scan Attendance', path: '/scan-qr', icon: <ScanLine size={20} /> },
  ];

  const menuItems = user.role === 'ADMIN' ? adminMenu : employeeMenu;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-sq">M</div>
          <span>Payroll And Leave Management</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.title}</span>
              {location.pathname === item.path && (
                <motion.div layoutId="active" className="nav-active-pill" />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search anything..." />
          </div>

          <div className="header-actions">
            <button className="action-btn"><Bell size={20} /></button>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user.displayName}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <img
                src="/default-avatar.png"
                alt="Profile"
                className="user-avatar"
              />
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>

      <style>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 260px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          padding: 24px;
          position: fixed;
          height: 100vh;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 700;
          font-size: 18px;
          color: #1e293b;
          margin-bottom: 40px;
        }
        .logo-sq {
          background: var(--primary);
          color: white;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .sidebar-nav {
          flex: 1;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          text-decoration: none;
          color: #64748b;
          border-radius: 12px;
          margin-bottom: 4px;
          position: relative;
          transition: all 0.2s;
        }
        .nav-link:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .nav-link.active {
          color: var(--primary);
          background: #eff6ff;
        }
        .nav-active-pill {
          position: absolute;
          left: 0;
          width: 4px;
          height: 20px;
          background: var(--primary);
          border-radius: 0 4px 4px 0;
        }
        .sidebar-footer {
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          color: #ef4444;
          border-radius: 12px;
          font-weight: 500;
        }
        .logout-btn:hover {
          background: #fef2f2;
        }
        .main-content {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
        }
        .header {
          height: 72px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .header-search {
          position: relative;
          width: 300px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .header-search input {
          width: 100%;
          padding: 8px 12px 8px 40px;
          background: #f1f5f9;
          border: 1px solid transparent;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s;
        }
        .header-search input:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .action-btn {
          background: transparent;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-info {
          text-align: right;
          display: flex;
          flex-direction: column;
        }
        .user-name {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
        }
        .user-role {
          font-size: 12px;
          color: #64748b;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 0 0 1px #e2e8f0;
        }
        .content-area {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
