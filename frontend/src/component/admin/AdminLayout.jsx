import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import './AdminLayout.css';

const PAGE_TITLES = {
    '/admin':                       'Dashboard',
    '/admin/manage-rooms':          'Manage Rooms',
    '/admin/add-room':              'Add Room',
    '/admin/manage-bookings':       'Manage Bookings',
    '/admin/manage-coupons':        'Manage Coupons',
    '/admin/manage-meal-plans':     'Manage Meal Plans',
    '/admin/payment-reports':       'Payment Reports',
    '/admin/manage-locations':      'Manage Locations',
};

const getPageTitle = (pathname) => {
    if (pathname.startsWith('/admin/edit-room/'))    return 'Edit Room';
    if (pathname.startsWith('/admin/edit-booking/')) return 'Edit Booking';
    return PAGE_TITLES[pathname] || 'Admin';
};

const NAV_LINKS = [
    { to: '/admin',                    end: true,  icon: '⊞',  label: 'Dashboard'       },
    { to: '/admin/manage-rooms',       end: false, icon: '🛏',  label: 'Rooms'           },
    { to: '/admin/manage-bookings',    end: false, icon: '📋',  label: 'Bookings'        },
    { to: '/admin/payment-reports',    end: false, icon: '💰',  label: 'Payments'        },
    { to: '/admin/manage-coupons',     end: false, icon: '🎟',  label: 'Coupons'         },
    { to: '/admin/manage-meal-plans',  end: false, icon: '🍽',  label: 'Meal Plans'      },
    { to: '/admin/manage-locations',   end: false, icon: '📍',  label: 'Locations'       },
];

const AdminLayout = () => {
    const [adminName, setAdminName] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        ApiService.getUserProfile()
            .then(res => setAdminName(res.user.name))
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        if (window.confirm('Log out of admin panel?')) {
            ApiService.logout();
            navigate('/login');
        }
    };

    const pageTitle = getPageTitle(location.pathname);
    const adminInitial = adminName ? adminName[0].toUpperCase() : 'A';

    return (
        <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <span className="admin-sidebar-logo">SmartStays</span>
                    <button
                        className="admin-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >✕</button>
                </div>

                <div className="admin-sidebar-section-label">NAVIGATION</div>

                <nav className="admin-sidebar-nav">
                    <ul>
                        {NAV_LINKS.map(link => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    end={link.end}
                                    className={({ isActive }) =>
                                        'admin-nav-link' + (isActive ? ' admin-nav-link--active' : '')
                                    }
                                >
                                    <span className="admin-nav-icon">{link.icon}</span>
                                    <span className="admin-nav-label">{link.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-sidebar-user">
                        <div className="admin-sidebar-avatar">{adminInitial}</div>
                        <div className="admin-sidebar-user-info">
                            <span className="admin-sidebar-username">{adminName || 'Admin'}</span>
                            <span className="admin-sidebar-role">Administrator</span>
                        </div>
                    </div>
                    <button className="admin-sidebar-logout" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main area ── */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <button
                        className="admin-hamburger"
                        onClick={() => setSidebarOpen(s => !s)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? '✕' : '☰'}
                    </button>
                    <h1 className="admin-topbar-title">{pageTitle}</h1>
                    <div className="admin-topbar-right">
                        <div className="admin-topbar-user">
                            <div className="admin-topbar-avatar">{adminInitial}</div>
                            <span className="admin-topbar-name">{adminName || 'Admin'}</span>
                        </div>
                        <button className="admin-topbar-home" onClick={() => navigate('/home')} title="Back to site">
                            ↗ View Site
                        </button>
                    </div>
                </header>

                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
