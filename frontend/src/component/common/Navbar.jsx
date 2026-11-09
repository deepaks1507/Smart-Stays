import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

function Navbar() {
    const isAuthenticated = ApiService.isAuthenticated();
    const isAdmin = ApiService.isAdmin();
    const isUser = ApiService.isUser();
    const navigate = useNavigate();

    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchNotifications = async () => {
            try {
                const profileRes = await ApiService.getUserProfile();
                const uid = profileRes.user.id;
                const [notifRes, countRes] = await Promise.all([
                    ApiService.getUserNotifications(uid),
                    ApiService.getUnreadNotificationCount(uid),
                ]);
                setNotifications(notifRes.notificationList || []);
                setUnreadCount(countRes.unreadCount || 0);
            } catch (_) {}
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = async () => {
        setShowDropdown(prev => !prev);
        if (!showDropdown && unreadCount > 0) {
            try {
                const profileRes = await ApiService.getUserProfile();
                await ApiService.markNotificationsRead(profileRes.user.id);
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (_) {}
        }
    };

    const handleLogout = () => {
        const isLogout = window.confirm('Are you sure you want to logout this user?');
        if (isLogout) {
            ApiService.logout();
            navigate('/home');
        }
    };

    const NOTIF_META = {
        BOOKING_CONFIRM: { icon: '✅', color: '#2e7d32', bg: '#e8f5e9' },
        REMINDER:        { icon: '⏰', color: '#f57c00', bg: '#fff3e0' },
        OFFER:           { icon: '🎁', color: '#7b1fa2', bg: '#f3e5f5' },
        CANCELLATION:    { icon: '❌', color: '#c62828', bg: '#fce4e4' },
    };

    const getNotifMeta = (type) => NOTIF_META[type] || { icon: '🔔', color: '#007F86', bg: '#e6f7f7' };

    const formatNotifTime = (sentAt) => {
        if (!sentAt) return '';
        const d = new Date(sentAt);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/home">SmartStays</NavLink>
            </div>
            <ul className="navbar-ul">
                <li><NavLink to="/home" activeclassname="active">Home</NavLink></li>
                <li><NavLink to="/rooms" activeclassname="active">Rooms</NavLink></li>

                {isUser && <li><NavLink to="/profile" activeclassname="active">Profile</NavLink></li>}
                {isAdmin && <li><NavLink to="/admin" activeclassname="active">Admin</NavLink></li>}

                {!isAuthenticated && <li><NavLink to="/login" activeclassname="active">Login</NavLink></li>}
                {!isAuthenticated && <li><NavLink to="/register" activeclassname="active">Register</NavLink></li>}
                {isAuthenticated && <li onClick={handleLogout}>Logout</li>}

                {isAuthenticated && (
                    <li className="navbar-bell-wrap" ref={dropdownRef}>
                        <button className="navbar-bell-btn" onClick={handleBellClick} aria-label="Notifications">
                            <span className="bell-icon">🔔</span>
                            {unreadCount > 0 && (
                                <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>
                        {showDropdown && (
                            <div className="notif-dropdown">
                                <div className="notif-dropdown-header">
                                    <span>Notifications</span>
                                    {unreadCount === 0 && notifications.length > 0 && (
                                        <span className="notif-all-read">All caught up ✓</span>
                                    )}
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <span className="notif-empty-icon">🔔</span>
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    <>
                                        {notifications.slice(0, 10).map(n => {
                                            const meta = getNotifMeta(n.type);
                                            return (
                                                <div key={n.id} className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}>
                                                    <div className="notif-icon-wrap" style={{ background: meta.bg }}>
                                                        <span>{meta.icon}</span>
                                                    </div>
                                                    <div className="notif-body">
                                                        <p className="notif-title">{n.title}</p>
                                                        <p className="notif-msg">{n.message}</p>
                                                        <span className="notif-time">{formatNotifTime(n.sentAt)}</span>
                                                    </div>
                                                    {!n.isRead && <span className="notif-dot" />}
                                                </div>
                                            );
                                        })}
                                        {notifications.length > 10 && (
                                            <div className="notif-more">
                                                +{notifications.length - 10} more notifications
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
