import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import LanguageToggle from './LanguageToggle';
import Translate from './Translate';
import '../styles/sidebar.css';

const navItems = [
  {
    path: '/admin/dashboard',
    icon: 'dashboard',
    label: <Translate textKey="dashboard" fallback="Dashboard" />
  },
  {
    path: '/admin/pending-users',
    icon: 'rule',
    label: <Translate textKey="pendingApprovals" fallback="Pending Approvals" />
  },
  {
    path: '/admin/users',
    icon: 'supervisor_account',
    label: <Translate textKey="manageUsers" fallback="Manage Users" />
  }
];

const iconPalette = {
  dashboard: {
    background: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)',
    color: '#0b1f4e'
  },
  rule: {
    background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
    color: '#0b1f4e'
  },
  supervisor_account: {
    background: 'linear-gradient(135deg, #1B74E4 0%, #54C6FF 100%)',
    color: '#ffffff'
  }
};

const defaultIconStyle = {
  background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
  color: '#ffffff'
};

const AdminNavbar = () => {
  const { adminUser, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleClose = () => setShowSidebar(false);
  const handleShow = () => setShowSidebar(true);

  const handleLogout = () => {
    adminLogout()
      .then(() => {
        navigate('/admin/login');
      })
      .catch(error => {
        console.error('Failed to log out', error);
      });
  };

  const isActive = (path) => location.pathname === path;

  const renderNavItem = (item, closeSidebar = false) => {
    const iconStyle = iconPalette[item.icon] || defaultIconStyle;
    return (
      <Nav.Link
        key={item.path}
        as={Link}
        to={item.path}
        className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
        onClick={() => closeSidebar && handleClose()}
      >
        <span className="sidebar-icon" style={iconStyle}>
          <span className="material-icons-outlined google-icon">{item.icon}</span>
        </span>
        <span className="sidebar-text">{item.label}</span>
      </Nav.Link>
    );
  };

  const sidebarHeader = (
    <div className="sidebar-top">
      <Link to="/admin/dashboard" className="sidebar-logo text-decoration-none">
        Admin Control Center
      </Link>
      {adminUser && (
        <div className="sidebar-user-meta">
          <div className="sidebar-user-name">{adminUser?.name || adminUser?.email}</div>
          <div className="sidebar-user-role">
            <i className="bi bi-shield-lock-fill"></i>
            Super Admin
          </div>
        </div>
      )}
    </div>
  );

  const sidebarFooter = (closeSidebar = false) => (
    <div className="sidebar-footer d-flex flex-column gap-2 px-3">
      <LanguageToggle />
      {adminUser && (
        <Button
          variant="outline-danger"
          onClick={() => {
            handleLogout();
            if (closeSidebar) {
              handleClose();
            }
          }}
        >
          <Translate textKey="logout" />
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <Navbar bg="primary" variant="dark" className="mb-3 d-lg-none shadow-sm">
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Button variant="outline-light" onClick={handleShow}>
            <i className="bi bi-list"></i>
          </Button>
          <Navbar.Brand as={Link} to="/admin/dashboard" className="fw-bold text-uppercase">
            Admin Portal
          </Navbar.Brand>
          <div className="d-flex align-items-center gap-2">
            <LanguageToggle />
          </div>
        </Container>
      </Navbar>

      {/* Mobile sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={handleClose}
        className="app-mobile-sidebar"
        placement="start"
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>
            <Translate textKey="adminPanel" fallback="Admin Panel" />
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {sidebarHeader}
          <Nav className="flex-column sidebar-nav">
            {navItems.map(item => renderNavItem(item, true))}
          </Nav>
          {sidebarFooter(true)}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop sidebar */}
      <div className="app-sidebar d-none d-lg-flex flex-column">
        {sidebarHeader}
        <Nav className="flex-column sidebar-nav flex-grow-1">
          {navItems.map(renderNavItem)}
        </Nav>
        {sidebarFooter()}
      </div>
    </>
  );
};

export default AdminNavbar;
