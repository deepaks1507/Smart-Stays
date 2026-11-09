import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from '../../service/ApiService';

const AdminPage = () => {
    const [adminName, setAdminName] = useState('');
    const [stats, setStats] = useState({ rooms: null, bookings: null, activeCoupons: null, totalRevenue: null });
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            ApiService.getUserProfile(),
            ApiService.getAllRooms(),
            ApiService.getAllBookings(),
            ApiService.getAllCoupons(),
            ApiService.getPaymentReport(),
        ]).then(([profileRes, roomsRes, bookingsRes, couponsRes, paymentRes]) => {
            setAdminName(profileRes.user.name);
            const revenue = (paymentRes.paymentList || [])
                .filter(p => p.status === 'SUCCESS')
                .reduce((sum, p) => sum + Number(p.amount || 0), 0);
            setStats({
                rooms:         (roomsRes.roomList || []).length,
                bookings:      (bookingsRes.bookingList || []).length,
                activeCoupons: (couponsRes.couponList || []).filter(c => c.active).length,
                totalRevenue:  revenue,
            });
        }).catch(err => console.error('Admin dashboard error:', err));
    }, []);

    const fmtRevenue = (v) =>
        v === null ? '—' : `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

    const STAT_CARDS = [
        { label: 'Total Rooms',    value: stats.rooms,        icon: '🛏', path: '/admin/manage-rooms'    },
        { label: 'Total Bookings', value: stats.bookings,     icon: '📋', path: '/admin/manage-bookings' },
        { label: 'Active Coupons', value: stats.activeCoupons,icon: '🎟', path: '/admin/manage-coupons'  },
        { label: 'Total Revenue',  value: fmtRevenue(stats.totalRevenue), icon: '💰', path: '/admin/payment-reports' },
    ];

    const ACTION_TILES = [
        { icon: '🛏️', label: 'Manage Rooms',      path: '/admin/manage-rooms'      },
        { icon: '📋', label: 'Manage Bookings',   path: '/admin/manage-bookings'   },
        { icon: '💰', label: 'Payment Reports',   path: '/admin/payment-reports'   },
        { icon: '🎟️', label: 'Manage Coupons',    path: '/admin/manage-coupons'    },
        { icon: '🍽️', label: 'Manage Meal Plans',  path: '/admin/manage-meal-plans' },
    ];

    const adminInitial = adminName ? adminName[0].toUpperCase() : 'A';

    return (
        <div className="admin-dashboard">
            {/* Greeting */}
            <div className="admin-hero">
                <div className="admin-hero-avatar">{adminInitial}</div>
                <div>
                    <h2 className="welcome-message">Welcome back, {adminName || 'Admin'}</h2>
                    <p className="admin-subtitle">Here's your SmartStays property overview</p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="admin-stat-cards">
                {STAT_CARDS.map(s => (
                    <div key={s.label} className="admin-stat-card" onClick={() => navigate(s.path)}>
                        <span className="admin-stat-card-icon">{s.icon}</span>
                        <div>
                            <div className="admin-stat-card-value">
                                {s.value === null ? '—' : s.value}
                            </div>
                            <div className="admin-stat-card-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <p className="admin-section-title">Quick Actions</p>
            <div className="admin-tiles">
                {ACTION_TILES.map(t => (
                    <div key={t.path} className="admin-tile" onClick={() => navigate(t.path)}>
                        <span className="admin-tile-icon">{t.icon}</span>
                        <span className="admin-tile-label">{t.label}</span>
                        <span className="admin-tile-arrow">→</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;
