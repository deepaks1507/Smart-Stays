import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import AddReviewModal from '../review/AddReviewModal';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
    const [reviewModalBookingId, setReviewModalBookingId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelError, setCancelError] = useState(null);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const navigate = useNavigate();

    // Keep localStorage in sync whenever cancelledBookings changes
    useEffect(() => {
        if (userId) localStorage.setItem(`cancelledBookings_${userId}`, JSON.stringify(cancelledBookings));
    }, [cancelledBookings, userId]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await ApiService.getUserProfile();
                const uid = response.user.id;

                const [userPlusBookings, reviewsResponse, wishlistRes] = await Promise.all([
                    ApiService.getUserBookings(uid),
                    ApiService.getReviewsByUser(uid),
                    ApiService.getUserWishlist(uid),
                ]);

                setUser(userPlusBookings.user);
                setUserId(uid);

                // Load persisted cancelled bookings for this user
                try {
                    const stored = JSON.parse(localStorage.getItem(`cancelledBookings_${uid}`) || '[]');
                    setCancelledBookings(stored);
                } catch { setCancelledBookings([]); }

                if (reviewsResponse.reviewList) {
                    const ids = new Set(reviewsResponse.reviewList.map((r) => r.bookingId));
                    setReviewedBookingIds(ids);
                }

                setWishlistItems(wishlistRes.wishlistList || []);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
            }
        };
        fetchUserProfile();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        try {
            setCancelError(null);
            const booking = user?.bookings?.find(b => b.id === bookingId);
            await ApiService.cancelBooking(bookingId);
            const cancelled = { ...booking, cancelled: true };
            setCancelledBookings(prev => {
                const updated = [...prev.filter(b => b.id !== bookingId), cancelled];
                return updated;
            });
            setUser(prev => ({
                ...prev,
                bookings: (prev.bookings || []).filter(b => b.id !== bookingId)
            }));
            setCancellingId(null);
        } catch (err) {
            setCancelError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
            setCancellingId(null);
        }
    };

    const handleLogout = () => {
        ApiService.logout();
        navigate('/home');
    };

    const handleRemoveWishlist = async (roomId) => {
        try {
            await ApiService.toggleWishlist(userId, roomId);
            setWishlistItems(prev => prev.filter(w => w.roomId !== roomId));
        } catch (_) {}
    };

    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings  = user?.bookings?.filter((b) => b.checkInDate >= today) || [];
    const completedBookings = user?.bookings?.filter((b) => b.checkOutDate < today)  || [];
    const pastBookings      = [...completedBookings, ...cancelledBookings];
    const totalBookings     = (user?.bookings || []).length + cancelledBookings.length;

    const handleReviewSuccess = (bookingId) => {
        setReviewedBookingIds((prev) => new Set([...prev, bookingId]));
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const formatDate = (d) => {
        if (!d) return '—';
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    const renderBookingCard = (booking, isPast) => {
        const isCancelled = !!booking.cancelled;
        const nights = (() => {
            if (!booking.checkInDate || !booking.checkOutDate) return null;
            const diff = new Date(booking.checkOutDate) - new Date(booking.checkInDate);
            return Math.round(diff / (1000 * 60 * 60 * 24));
        })();

        return (
            <div key={booking.id} className={`profile-booking-card ${isCancelled ? 'booking-cancelled' : ''}`}>
                <div className="profile-booking-img-wrap">
                    <img src={booking.room?.roomPhotoUrl} alt={booking.room?.roomType} />
                    {isCancelled
                        ? <span className="booking-status-badge badge-cancelled">Cancelled</span>
                        : isPast
                            ? <span className="booking-status-badge badge-past">Completed</span>
                            : <span className="booking-status-badge badge-upcoming">Upcoming</span>
                    }
                </div>
                <div className="profile-booking-body">
                    <div className="profile-booking-header">
                        <div>
                            <h4>{booking.room?.roomName || booking.room?.roomType}</h4>
                            {booking.room?.roomName && (
                                <span className="profile-booking-room-type">{booking.room.roomType}</span>
                            )}
                        </div>
                        {nights && <span className="profile-booking-nights">{nights} night{nights !== 1 ? 's' : ''}</span>}
                    </div>

                    {booking.room?.location && (
                        <p className="profile-booking-location">📍 {booking.room.location}</p>
                    )}

                    <div className="profile-booking-meta">
                        <div className="profile-booking-meta-item">
                            <span className="meta-label">Check-in</span>
                            <span className="meta-value">{formatDate(booking.checkInDate)}</span>
                        </div>
                        <div className="profile-booking-meta-divider" />
                        <div className="profile-booking-meta-item">
                            <span className="meta-label">Check-out</span>
                            <span className="meta-value">{formatDate(booking.checkOutDate)}</span>
                        </div>
                        <div className="profile-booking-meta-divider" />
                        <div className="profile-booking-meta-item">
                            <span className="meta-label">Guests</span>
                            <span className="meta-value">
                                {booking.numOfAdults} adult{booking.numOfAdults !== 1 ? 's' : ''}
                                {booking.numOfChildren > 0 ? `, ${booking.numOfChildren} child` : ''}
                            </span>
                        </div>
                        {booking.room?.roomPrice && (
                            <>
                                <div className="profile-booking-meta-divider" />
                                <div className="profile-booking-meta-item">
                                    <span className="meta-label">Price/night</span>
                                    <span className="meta-value">₹{Number(booking.room.roomPrice).toLocaleString('en-IN')}</span>
                                </div>
                            </>
                        )}
                        {nights && booking.room?.roomPrice && (
                            <>
                                <div className="profile-booking-meta-divider" />
                                <div className="profile-booking-meta-item">
                                    <span className="meta-label">Total</span>
                                    <span className="meta-value">₹{(Number(booking.room.roomPrice) * nights).toLocaleString('en-IN')}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {booking.room?.roomDescription && (
                        <p className="profile-booking-description">{booking.room.roomDescription}</p>
                    )}

                    {booking.room?.amenities?.length > 0 && (
                        <div className="profile-booking-amenities">
                            {booking.room.amenities.slice(0, 6).map(a => (
                                <span key={a.id} className="profile-amenity-tag">{a.name}</span>
                            ))}
                            {booking.room.amenities.length > 6 && (
                                <span className="profile-amenity-tag profile-amenity-more">
                                    +{booking.room.amenities.length - 6} more
                                </span>
                            )}
                        </div>
                    )}

                    <p className="profile-booking-code">
                        Confirmation: <strong>{booking.bookingConfirmationCode}</strong>
                    </p>
                    {isCancelled ? (
                        <span className="cancelled-label">This booking was cancelled</span>
                    ) : isPast ? (
                        reviewedBookingIds.has(booking.id)
                            ? <span className="reviewed-badge">✓ Reviewed</span>
                            : (
                                <button
                                    className="leave-review-button"
                                    onClick={() => setReviewModalBookingId(booking.id)}
                                >
                                    Leave a Review
                                </button>
                            )
                    ) : (
                        cancellingId === booking.id ? (
                            <div className="cancel-confirm-row">
                                <span className="cancel-confirm-text">Cancel this booking?</span>
                                <button className="cancel-confirm-yes" onClick={() => handleCancelBooking(booking.id)}>
                                    Yes, Cancel
                                </button>
                                <button className="cancel-confirm-no" onClick={() => setCancellingId(null)}>
                                    Keep
                                </button>
                            </div>
                        ) : (
                            <button className="cancel-booking-btn" onClick={() => setCancellingId(booking.id)}>
                                Cancel Booking
                            </button>
                        )
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="profile-page">
            {error && <p className="error-message">{error}</p>}

            {/* ── Profile hero card ── */}
            {user && (
                <div className="profile-hero-card">
                    <div className="profile-avatar">{initials}</div>
                    <div className="profile-hero-info">
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        {user.phoneNumber && <p>{user.phoneNumber}</p>}
                    </div>
                    <div className="profile-hero-stats">
                        <div className="profile-stat">
                            <span className="profile-stat-value">{totalBookings}</span>
                            <span className="profile-stat-label">Total Stays</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat-value">{upcomingBookings.length}</span>
                            <span className="profile-stat-label">Upcoming</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat-value">{wishlistItems.length}</span>
                            <span className="profile-stat-label">Wishlist</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat-value">{reviewedBookingIds.size}</span>
                            <span className="profile-stat-label">Reviews</span>
                        </div>
                    </div>
                    <div className="profile-hero-actions">
                        <button className="profile-action-btn profile-action-edit" onClick={() => navigate('/edit-profile')}>
                            Edit Profile
                        </button>
                        <button className="profile-action-btn profile-action-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            )}

            {/* ── Tabs ── */}
            <div className="profile-bookings-section">
                {cancelError && <p className="error-message">{cancelError}</p>}
                <div className="booking-tabs">
                    <button
                        className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                        {upcomingBookings.length > 0 && (
                            <span className="tab-count">{upcomingBookings.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Past Bookings
                        {pastBookings.length > 0 && (
                            <span className="tab-count">{pastBookings.length}</span>
                        )}
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'wishlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('wishlist')}
                    >
                        ❤️ Wishlist
                        {wishlistItems.length > 0 && (
                            <span className="tab-count">{wishlistItems.length}</span>
                        )}
                    </button>
                </div>

                <div className="profile-booking-list">
                    {activeTab === 'upcoming' && (
                        upcomingBookings.length > 0
                            ? upcomingBookings.map((b) => renderBookingCard(b, false))
                            : (
                                <div className="profile-empty-state">
                                    <span className="profile-empty-icon">🏨</span>
                                    <p>No upcoming bookings</p>
                                    <button className="hero-cta" style={{marginTop: 16}} onClick={() => navigate('/rooms')}>
                                        Browse Rooms
                                    </button>
                                </div>
                            )
                    )}
                    {activeTab === 'past' && (
                        pastBookings.length > 0
                            ? pastBookings.map((b) => renderBookingCard(b, !b.cancelled))
                            : (
                                <div className="profile-empty-state">
                                    <span className="profile-empty-icon">📋</span>
                                    <p>No past bookings yet</p>
                                </div>
                            )
                    )}
                    {activeTab === 'wishlist' && (
                        wishlistItems.length > 0
                            ? (
                                <div className="wishlist-grid">
                                    {wishlistItems.map(w => (
                                        <div key={w.id} className="wishlist-card">
                                            <div className="wishlist-card-img-wrap">
                                                <img src={w.roomPhotoUrl} alt={w.roomType} />
                                                <button
                                                    className="wishlist-remove-btn"
                                                    onClick={() => handleRemoveWishlist(w.roomId)}
                                                    title="Remove from wishlist"
                                                >❤️</button>
                                            </div>
                                            <div className="wishlist-card-body">
                                                <h4>{w.roomType}</h4>
                                                <p className="wishlist-price">₹{w.roomPrice} / night</p>
                                                <button
                                                    className="book-now-button"
                                                    style={{marginTop: 8, width: '100%'}}
                                                    onClick={() => navigate(`/room-details-book/${w.roomId}`)}
                                                >
                                                    View & Book
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                            : (
                                <div className="profile-empty-state">
                                    <span className="profile-empty-icon">🤍</span>
                                    <p>No saved rooms yet</p>
                                    <button className="hero-cta" style={{marginTop: 16}} onClick={() => navigate('/rooms')}>
                                        Explore Rooms
                                    </button>
                                </div>
                            )
                    )}
                </div>
            </div>

            {reviewModalBookingId && (
                <AddReviewModal
                    bookingId={reviewModalBookingId}
                    userId={userId}
                    onClose={() => setReviewModalBookingId(null)}
                    onSubmitSuccess={() => handleReviewSuccess(reviewModalBookingId)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
