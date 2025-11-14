import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas, Collapse } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageToggle from './LanguageToggle';
import Translate from './Translate';
import '../styles/sidebar.css';

const MainNavbar = () => {
  const { currentUser, logout, shopData, staffData, isStaff, isGuest } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  
  // Check if we're on an expenses page to auto-open the menu
  const isExpensesPage = location.pathname === '/expenses' || location.pathname === '/add-expense' || location.pathname === '/expense-categories';
  const [expensesOpen, setExpensesOpen] = useState(isExpensesPage);
  const [expensesOpenMobile, setExpensesOpenMobile] = useState(isExpensesPage);

  // Check if we're on an attendance page to auto-open the menu
  const isAttendancePage = location.pathname === '/attendance' || location.pathname === '/mark-attendance' || location.pathname === '/attendance-report';
  const [attendanceOpen, setAttendanceOpen] = useState(isAttendancePage);
  const [attendanceOpenMobile, setAttendanceOpenMobile] = useState(isAttendancePage);

  // Check if we're on an employees page to auto-open the menu
  const isEmployeesPage = location.pathname === '/employees' || location.pathname === '/add-employee';
  const [employeesOpen, setEmployeesOpen] = useState(isEmployeesPage);
  const [employeesOpenMobile, setEmployeesOpenMobile] = useState(isEmployeesPage);

  // Auto-open expenses menu when on expenses pages
  useEffect(() => {
    if (isExpensesPage) {
      setExpensesOpen(true);
      setExpensesOpenMobile(true);
    }
  }, [isExpensesPage]);

  // Auto-open attendance menu when on attendance pages
  useEffect(() => {
    if (isAttendancePage) {
      setAttendanceOpen(true);
      setAttendanceOpenMobile(true);
    }
  }, [isAttendancePage]);

  // Auto-open employees menu when on employees pages
  useEffect(() => {
    if (isEmployeesPage) {
      setEmployeesOpen(true);
      setEmployeesOpenMobile(true);
    }
  }, [isEmployeesPage]);

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/login');
      })
      .catch(error => {
        console.error('Failed to log out', error);
      });
  };

  // Helper function to check if staff has permission
  const hasPermission = (permission) => {
    if (!isStaff || !staffData) return true; // Shop owners have all permissions
    return staffData.permissions && staffData.permissions[permission];
  };
  const isActive = (path) => location.pathname === path;

  const userDisplayName = staffData?.name || shopData?.ownerName || currentUser?.displayName || currentUser?.email || 'User';
  let userRoleLabel = 'Super Admin';
  if (isGuest) {
    userRoleLabel = 'Guest User';
  } else if (isStaff) {
    userRoleLabel = staffData?.role || 'Staff Member';
  }

  const defaultGoogleIconStyle = {
    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
    color: '#ffffff'
  };

  const googleIconPalette = {
    dashboard: {
      background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
      color: '#ffffff'
    },
    point_of_sale: {
      background: 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)',
      color: '#ffffff'
    },
    receipt_long: {
      background: 'linear-gradient(135deg, #34A853 0%, #0F9D58 100%)',
      color: '#ffffff'
    },
    query_stats: {
      background: 'linear-gradient(135deg, #A142F4 0%, #4285F4 100%)',
      color: '#ffffff'
    },
    inventory_2: {
      background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
      color: '#0b1f4e'
    },
    groups: {
      background: 'linear-gradient(135deg, #34A853 0%, #B8E986 100%)',
      color: '#0b1f4e'
    },
    group_add: {
      background: 'linear-gradient(135deg, #1B74E4 0%, #54C6FF 100%)',
      color: '#ffffff'
    },
    payments: {
      background: 'linear-gradient(135deg, #FBBC05 0%, #FEEA84 100%)',
      color: '#0b1f4e'
    },
    add_card: {
      background: 'linear-gradient(135deg, #EA4335 0%, #FF8A65 100%)',
      color: '#ffffff'
    },
    category: {
      background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
      color: '#ffffff'
    },
    event_available: {
      background: 'linear-gradient(135deg, #34A853 0%, #0F9D58 100%)',
      color: '#ffffff'
    },
    how_to_reg: {
      background: 'linear-gradient(135deg, #0F9D58 0%, #4285F4 100%)',
      color: '#ffffff'
    },
    assignment: {
      background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
      color: '#ffffff'
    },
    settings: {
      background: 'linear-gradient(135deg, #5C6BC0 0%, #1A237E 100%)',
      color: '#ffffff'
    },
    admin_panel_settings: {
      background: 'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
      color: '#ffffff'
    },
    shopping_bag: {
      background: 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)',
      color: '#ffffff'
    },
    badge: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff'
    }
  };

  const renderNavItem = (path, iconKey, label, closeSidebar = false) => {
    const iconStyle = googleIconPalette[iconKey] || defaultGoogleIconStyle;
    return (
    <Nav.Link
      as={Link}
      to={path}
      className={`sidebar-link ${isActive(path) ? 'active' : ''}`}
      onClick={() => {
        if (closeSidebar) {
          setShowSidebar(false);
        }
      }}
    >
      <span className="sidebar-icon" style={iconStyle}>
        <span className="material-icons-outlined google-icon">{iconKey}</span>
      </span>
      <span className="sidebar-text">{label}</span>
    </Nav.Link>
    );
  };

  const renderSubNavItem = (path, label, closeSidebar = false, indent = true) => {
    return (
      <Nav.Link
        as={Link}
        to={path}
        className={`sidebar-link ${isActive(path) ? 'active' : ''} ${indent ? 'sidebar-sub-item' : ''}`}
        onClick={() => {
          if (closeSidebar) {
            setShowSidebar(false);
          }
        }}
      >
        <span className="sidebar-text">{label}</span>
      </Nav.Link>
    );
  };

  const renderExpensesMenu = (closeSidebar = false, isMobile = false) => {
    const isOpen = isMobile ? expensesOpenMobile : expensesOpen;
    const setIsOpen = isMobile ? setExpensesOpenMobile : setExpensesOpen;
    const iconStyle = googleIconPalette['payments'] || defaultGoogleIconStyle;
    const isExpensesActive = isActive('/expenses') || isActive('/add-expense') || isActive('/expense-categories');

    return (
      <>
        <div 
          className={`sidebar-link ${isExpensesActive ? 'active' : ''}`}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sidebar-icon" style={iconStyle}>
            <span className="material-icons-outlined google-icon">payments</span>
          </span>
          <span className="sidebar-text">Expenses</span>
          <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
        </div>
        <Collapse in={isOpen}>
          <div className="sidebar-submenu">
            {!isStaff && (
              renderSubNavItem('/add-expense', <Translate textKey="addExpense" fallback="Add Expense" />, closeSidebar)
            )}
            {renderSubNavItem('/expenses', <Translate textKey="viewExpenses" fallback="View Expenses" />, closeSidebar)}
            {!isStaff && (
              renderSubNavItem('/expense-categories', <Translate textKey="expenseCategories" fallback="Expense Categories" />, closeSidebar)
            )}
          </div>
        </Collapse>
      </>
    );
  };

  const renderAttendanceMenu = (closeSidebar = false, isMobile = false) => {
    const isOpen = isMobile ? attendanceOpenMobile : attendanceOpen;
    const setIsOpen = isMobile ? setAttendanceOpenMobile : setAttendanceOpen;
    const iconStyle = googleIconPalette['event_available'] || defaultGoogleIconStyle;
    const isAttendanceActive = isActive('/attendance') || isActive('/mark-attendance') || isActive('/attendance-report');

    return (
      <>
        <div 
          className={`sidebar-link ${isAttendanceActive ? 'active' : ''}`}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sidebar-icon" style={iconStyle}>
            <span className="material-icons-outlined google-icon">event_available</span>
          </span>
          <span className="sidebar-text">Attendance</span>
          <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
        </div>
        <Collapse in={isOpen}>
          <div className="sidebar-submenu">
            {renderSubNavItem('/attendance', <Translate textKey="viewAttendance" />, closeSidebar)}
            {renderSubNavItem('/mark-attendance', <Translate textKey="markAttendance" />, closeSidebar)}
            {!isStaff && (
              renderSubNavItem('/attendance-report', <Translate textKey="attendanceReport" />, closeSidebar)
            )}
          </div>
        </Collapse>
      </>
    );
  };

  const renderEmployeesMenu = (closeSidebar = false, isMobile = false) => {
    const isOpen = isMobile ? employeesOpenMobile : employeesOpen;
    const setIsOpen = isMobile ? setEmployeesOpenMobile : setEmployeesOpen;
    const iconStyle = googleIconPalette['groups'] || defaultGoogleIconStyle;
    const isEmployeesActive = isActive('/employees') || isActive('/add-employee');

    return (
      <>
        <div 
          className={`sidebar-link ${isEmployeesActive ? 'active' : ''}`}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sidebar-icon" style={iconStyle}>
            <span className="material-icons-outlined google-icon">groups</span>
          </span>
          <span className="sidebar-text">Employees</span>
          <i className={`bi ${isOpen ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
        </div>
        <Collapse in={isOpen}>
          <div className="sidebar-submenu">
            {renderSubNavItem('/employees', <Translate textKey="viewEmployees" />, closeSidebar)}
            {!isStaff && (
              renderSubNavItem('/add-employee', <Translate textKey="addEmployee" />, closeSidebar)
            )}
          </div>
        </Collapse>
      </>
    );
  };

  return (
    <>
      {/* Mobile Top Bar with Menu Button */}
      <Navbar bg="primary" variant="dark" className="mb-3 d-lg-none">
        <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard">
          {shopData ? shopData.shopName : 'Shop Billing System'}
        </Navbar.Brand>
          <Button variant="outline-light" onClick={() => setShowSidebar(true)}>
            <i className="bi bi-list"></i> <Translate textKey="menu" fallback="Menu" />
          </Button>
        </Container>
      </Navbar>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start" className="app-mobile-sidebar">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {shopData ? shopData.shopName : 'Shop Billing System'}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {currentUser && (
            <div className="sidebar-user-card mb-4">
              <div className="sidebar-user-icon">
                <i className="bi bi-person-fill"></i>
              </div>
              <div>
                <div className="sidebar-user-name">{userDisplayName}</div>
                <div className="sidebar-user-role">{userRoleLabel}</div>
              </div>
            </div>
          )}
          <Nav className="flex-column sidebar-nav">
            {currentUser ? (
              <>
                {renderNavItem('/dashboard', 'dashboard', <Translate textKey="dashboard" />, true)}
                {hasPermission('canCreateReceipts') && (
                  renderNavItem('/new-receipt', 'point_of_sale', <Translate textKey="newReceipt" />, true)
                )}
                {hasPermission('canViewReceipts') && (
                  renderNavItem('/receipts', 'receipt_long', <Translate textKey="receipts" />, true)
                )}
                {hasPermission('canViewAnalytics') && (
                  renderNavItem('/sales-analytics', 'query_stats', <Translate textKey="salesAnalytics" fallback="Sales Analytics" />, true)
                )}
                {hasPermission('canViewStock') && (
                  <>
                    {renderNavItem('/stock', 'inventory_2', <Translate textKey="inventory" />, true)}
                    {renderNavItem('/purchase-management', 'shopping_bag', <Translate textKey="purchaseManagement" fallback="Purchase Management" />, true)}
                  </>
                )}
                {hasPermission('canViewEmployees') && (
                  renderEmployeesMenu(true, true)
                )}
                {hasPermission('canManageExpenses') && (
                  renderExpensesMenu(true, true)
                )}
                {hasPermission('canMarkAttendance') && (
                  renderAttendanceMenu(true, true)
                )}
                {!isStaff && !isGuest && (
                  renderNavItem('/settings', 'settings', <Translate textKey="settings" />, true)
                )}
                {!isStaff && !isGuest && (
                  renderNavItem('/shop-profile', 'badge', 'Shop Profile', true)
                )}
                {!isStaff && !isGuest && (
                  renderNavItem('/staff-management', 'admin_panel_settings', 'Staff Management', true)
                )}
                <div className="d-flex mt-3">
                  <LanguageToggle />
                  <Button 
                    variant="outline-danger" 
                    className="ms-2"
                    onClick={() => { handleLogout(); setShowSidebar(false); }}
                  >
                    <Translate textKey="logout" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setShowSidebar(false)}><Translate textKey="login" /></Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={() => setShowSidebar(false)}><Translate textKey="register" /></Nav.Link>
                <LanguageToggle />
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop fixed sidebar */}
      <div className="app-sidebar d-none d-lg-block">
        <div className="sidebar-top">
          <Link to="/dashboard" className="sidebar-logo text-decoration-none">
            {shopData ? shopData.shopName : 'Shop Billing System'}
          </Link>
          {currentUser && (
            <div className="sidebar-user-meta">
              <div className="sidebar-user-name">{userDisplayName}</div>
              <div className="sidebar-user-role">{userRoleLabel}</div>
            </div>
          )}
        </div>
        <Nav className="flex-column sidebar-nav">
          {currentUser && (
            <>
              {renderNavItem('/dashboard', 'dashboard', <Translate textKey="dashboard" />)}
              {hasPermission('canCreateReceipts') && (
                renderNavItem('/new-receipt', 'point_of_sale', <Translate textKey="newReceipt" />)
              )}
              {hasPermission('canViewReceipts') && (
                renderNavItem('/receipts', 'receipt_long', <Translate textKey="receipts" />)
              )}
              {hasPermission('canViewAnalytics') && (
                renderNavItem('/sales-analytics', 'query_stats', <Translate textKey="salesAnalytics" fallback="Sales Analytics" />)
              )}
              {hasPermission('canViewStock') && (
                <>
                  {renderNavItem('/stock', 'inventory_2', <Translate textKey="inventory" />)}
                  {renderNavItem('/purchase-management', 'shopping_bag', <Translate textKey="purchaseManagement" fallback="Purchase Management" />)}
                </>
              )}
              {hasPermission('canViewEmployees') && (
                renderEmployeesMenu(false, false)
              )}
              {hasPermission('canManageExpenses') && (
                renderExpensesMenu(false, false)
              )}
              {hasPermission('canMarkAttendance') && (
                renderAttendanceMenu(false, false)
              )}
              {!isStaff && !isGuest && (
                renderNavItem('/settings', 'settings', <Translate textKey="settings" />)
              )}
              {!isStaff && !isGuest && (
                renderNavItem('/shop-profile', 'badge', 'Shop Profile')
              )}
              {!isStaff && !isGuest && (
                renderNavItem('/staff-management', 'admin_panel_settings', 'Staff Management')
              )}
            </>
          )}
        </Nav>
        <div className="sidebar-footer">
            {currentUser ? (
              <>
                <LanguageToggle />
              <Button variant="outline-danger" className="ms-2" onClick={handleLogout}>
                <Translate textKey="logout" />
              </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login"><Translate textKey="login" /></Nav.Link>
                <Nav.Link as={Link} to="/register"><Translate textKey="register" /></Nav.Link>
                <LanguageToggle />
              </>
            )}
        </div>
      </div>

      {/* Spacer so page content doesn't slide under the fixed sidebar on desktop */}
      <div className="d-none d-lg-block" style={{ width: '280px' }} />
    </>
  );
};

export default MainNavbar;
