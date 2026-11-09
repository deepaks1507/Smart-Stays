import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const LOCATIONS = [
    'All Locations',
    'Koregaon Park, Pune',
    'Baner, Pune',
    'Viman Nagar, Pune',
    'Hinjewadi, Pune',
    'Kothrud, Pune',
];

const ROOM_TYPES = ['All Types', 'PG', 'Hostel', 'Single Room', 'Double Room', 'Deluxe Room', 'Family Room', 'Banquet Hall'];

const STATUSES = ['All', 'Upcoming', 'Ongoing', 'Completed'];

const PER_PAGE = 10;

const today = new Date();
today.setHours(0, 0, 0, 0);

const parseDate = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
};

const getBookingStatus = (checkIn, checkOut) => {
    const ci = parseDate(checkIn);
    const co = parseDate(checkOut);
    if (today < ci) return 'Upcoming';
    if (today >= ci && today <= co) return 'Ongoing';
    return 'Completed';
};

const STATUS_STYLE = {
    Upcoming:  { background: '#dbeafe', color: '#1d4ed8' },
    Ongoing:   { background: '#dcfce7', color: '#15803d' },
    Completed: { background: '#f3f4f6', color: '#374151' },
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const nightsBetween = (ci, co) => {
    const a = parseDate(ci);
    const b = parseDate(co);
    const n = Math.round((b - a) / 86400000);
    return n > 0 ? n : 1;
};

const fmt = (v) =>
    v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';

const ManageBookingsPage = () => {
    const [bookings, setBookings]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [locationFilter, setLocationFilter] = useState('All Locations');
    const [typeFilter, setTypeFilter]       = useState('All Types');
    const [statusFilter, setStatusFilter]   = useState('All');
    const [sortBy, setSortBy]               = useState('newest');
    const [currentPage, setCurrentPage]     = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getAllBookings()
            .then(res => setBookings(res.bookingList || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = bookings
        .filter(b => {
            const loc  = b.room?.location || '';
            const type = b.room?.roomType || '';
            const stat = getBookingStatus(b.checkInDate, b.checkOutDate);
            const q    = search.toLowerCase();
            const matchLoc    = locationFilter === 'All Locations' || loc === locationFilter;
            const matchType   = typeFilter === 'All Types' || type === typeFilter;
            const matchStatus = statusFilter === 'All' || stat === statusFilter;
            const matchSearch =
                !q ||
                (b.bookingConfirmationCode || '').toLowerCase().includes(q) ||
                (b.user?.name  || '').toLowerCase().includes(q) ||
                (b.user?.email || '').toLowerCase().includes(q) ||
                (b.room?.roomName || b.room?.roomType || '').toLowerCase().includes(q);
            return matchLoc && matchType && matchStatus && matchSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'newest')   return parseDate(b.checkInDate) - parseDate(a.checkInDate);
            if (sortBy === 'oldest')   return parseDate(a.checkInDate) - parseDate(b.checkInDate);
            if (sortBy === 'checkout') return parseDate(b.checkOutDate) - parseDate(a.checkOutDate);
            return 0;
        });

    const totalPages   = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const safePage     = Math.min(currentPage, totalPages);
    const paginated    = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

    const resetFilters = () => {
        setSearch(''); setLocationFilter('All Locations');
        setTypeFilter('All Types'); setStatusFilter('All');
        setSortBy('newest'); setCurrentPage(1);
    };

    const counts = {
        All:       bookings.length,
        Upcoming:  bookings.filter(b => getBookingStatus(b.checkInDate, b.checkOutDate) === 'Upcoming').length,
        Ongoing:   bookings.filter(b => getBookingStatus(b.checkInDate, b.checkOutDate) === 'Ongoing').length,
        Completed: bookings.filter(b => getBookingStatus(b.checkInDate, b.checkOutDate) === 'Completed').length,
    };

    if (loading) return <div className="admin-page"><p>Loading bookings…</p></div>;

    return (
        <div className="admin-page">

            {/* ── Summary strip ── */}
            <div className="admin-stat-cards" style={{ marginBottom: '24px' }}>
                {[
                    { label: 'Total Bookings', value: counts.All,       icon: '📋' },
                    { label: 'Upcoming',        value: counts.Upcoming,  icon: '🗓' },
                    { label: 'Ongoing',         value: counts.Ongoing,   icon: '🏨' },
                    { label: 'Completed',       value: counts.Completed, icon: '✅' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setStatusFilter(s.label === 'Total Bookings' ? 'All' : s.label); setCurrentPage(1); }}
                    >
                        <span className="admin-stat-card-icon">{s.icon}</span>
                        <div>
                            <div className="admin-stat-card-value">{s.value}</div>
                            <div className="admin-stat-card-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'flex-end',
            }}>
                {/* Search */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={labelStyle}>Search</label>
                    <input
                        type="text"
                        placeholder="Name, email, booking code, room…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        style={inputStyle}
                    />
                </div>

                {/* Location */}
                <div style={{ minWidth: '180px' }}>
                    <label style={labelStyle}>Location</label>
                    <select value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                        {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                    </select>
                </div>

                {/* Room Type */}
                <div style={{ minWidth: '150px' }}>
                    <label style={labelStyle}>Room Type</label>
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                        {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>

                {/* Status */}
                <div style={{ minWidth: '130px' }}>
                    <label style={labelStyle}>Status</label>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={inputStyle}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* Sort */}
                <div style={{ minWidth: '150px' }}>
                    <label style={labelStyle}>Sort By</label>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
                        <option value="newest">Check-in: Newest</option>
                        <option value="oldest">Check-in: Oldest</option>
                        <option value="checkout">Check-out: Latest</option>
                    </select>
                </div>

                {/* Reset */}
                <button
                    onClick={resetFilters}
                    style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1.5px solid #d1d5db',
                        background: '#fff',
                        color: '#6b7280',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        alignSelf: 'flex-end',
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Results count */}
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Showing <strong>{filtered.length}</strong> of <strong>{bookings.length}</strong> bookings
            </p>

            {/* ── Booking cards ── */}
            {paginated.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    No bookings match your filters.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {paginated.map(booking => {
                        const stat   = getBookingStatus(booking.checkInDate, booking.checkOutDate);
                        const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);
                        const room   = booking.room || {};
                        const user   = booking.user || {};
                        const payment = (booking.payments || [])[0];
                        const amount = payment?.amount ?? (room.roomPrice != null ? room.roomPrice * nights : null);

                        return (
                            <div key={booking.id} style={{
                                background: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '20px 24px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr auto',
                                gap: '16px 24px',
                                alignItems: 'start',
                                transition: 'box-shadow 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                {/* ── Guest info ── */}
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                        Guest
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', marginBottom: '2px' }}>
                                        {user.name || '—'}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>
                                        {user.email || ''}
                                    </div>
                                    {user.phoneNumber && (
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            📞 {user.phoneNumber}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                                        <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                            {booking.bookingConfirmationCode}
                                        </span>
                                    </div>
                                </div>

                                {/* ── Room info ── */}
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                        Room
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', marginBottom: '2px' }}>
                                        {room.roomName || room.roomType || '—'}
                                    </div>
                                    {room.roomName && (
                                        <div style={{ fontSize: '12px', color: '#007F86', fontWeight: 600, marginBottom: '2px' }}>
                                            {room.roomType}
                                        </div>
                                    )}
                                    {room.location && (
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                            📍 {room.location}
                                        </div>
                                    )}
                                    {room.roomPrice != null && (
                                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                            {fmt(room.roomPrice)} / night
                                        </div>
                                    )}
                                </div>

                                {/* ── Dates + stats ── */}
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                        Stay Details
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#374151', marginBottom: '3px' }}>
                                        <span style={{ fontWeight: 600 }}>Check-in:</span> {fmtDate(booking.checkInDate)}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#374151', marginBottom: '3px' }}>
                                        <span style={{ fontWeight: 600 }}>Check-out:</span> {fmtDate(booking.checkOutDate)}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#374151', marginBottom: '3px' }}>
                                        <span style={{ fontWeight: 600 }}>Nights:</span> {nights}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#374151', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 600 }}>Guests:</span> {booking.totalNumOfGuest}
                                        {booking.numOfAdults > 0 && (
                                            <span style={{ color: '#9ca3af', marginLeft: '4px' }}>
                                                ({booking.numOfAdults} adult{booking.numOfAdults !== 1 ? 's' : ''}
                                                {booking.numOfChildren > 0 ? `, ${booking.numOfChildren} child${booking.numOfChildren !== 1 ? 'ren' : ''}` : ''})
                                            </span>
                                        )}
                                    </div>
                                    {amount != null && (
                                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#007F86' }}>
                                            {fmt(amount)}
                                        </div>
                                    )}
                                </div>

                                {/* ── Status + action ── */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                    <span style={{
                                        ...STATUS_STYLE[stat],
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {stat}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/admin/edit-booking/${booking.bookingConfirmationCode}`)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#007F86',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        Manage →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        style={pageBtn(false, safePage === 1)}
                    >← Prev</button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => Math.abs(p - safePage) <= 2 || p === 1 || p === totalPages)
                        .reduce((acc, p, idx, arr) => {
                            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) =>
                            p === '...'
                                ? <span key={`el-${i}`} style={{ alignSelf: 'center', color: '#9ca3af' }}>…</span>
                                : <button key={p} onClick={() => setCurrentPage(p)} style={pageBtn(p === safePage, false)}>{p}</button>
                        )
                    }

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        style={pageBtn(false, safePage === totalPages)}
                    >Next →</button>
                </div>
            )}
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: '4px',
};

const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
};

const pageBtn = (active, disabled) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: `1.5px solid ${active ? '#007F86' : '#e5e7eb'}`,
    background: active ? '#007F86' : '#fff',
    color: active ? '#fff' : disabled ? '#d1d5db' : '#374151',
    fontWeight: 600,
    fontSize: '13px',
    cursor: disabled ? 'not-allowed' : 'pointer',
});

export default ManageBookingsPage;
