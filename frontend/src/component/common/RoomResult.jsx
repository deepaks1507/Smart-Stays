import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const AMENITY_ICONS = {
    wifi:         '📶',
    ac:           '❄️',
    tv:           '📺',
    fridge:       '🧊',
    room_service: '🛎️',
    bathroom:     '🚿',
    shower:       '🚿',
    jacuzzi:      '🛁',
    pool:         '🏊',
    gym:          '🏋️',
    parking:      '🅿️',
    restaurant:   '🍽️',
    breakfast:    '🍳',
    desk:         '🖥️',
    locker:       '🔒',
    laundry:      '👕',
    security:     '🔒',
    balcony:      '🌅',
    kitchen:      '🍴',
    iron:         '👔',
};

const getAvailabilityBadge = (availableCount, totalInventory) => {
    if (totalInventory === 0) return null;
    if (availableCount === 0) return { text: 'Sold Out', cls: 'badge-sold-out' };
    if (availableCount <= 3) return { text: `Only ${availableCount} left!`, cls: 'badge-critical' };
    if (availableCount <= 5) return { text: `Hurry! ${availableCount} rooms left`, cls: 'badge-warning' };
    return { text: `${availableCount} rooms available`, cls: 'badge-available' };
};

const RoomResult = ({ roomSearchResults, layout = 'list' }) => {
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();
    const isUser = ApiService.isUser();

    const [wishlisted, setWishlisted] = useState(new Set());
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (!isUser) return;
        const fetchWishlist = async () => {
            try {
                const profileRes = await ApiService.getUserProfile();
                const uid = profileRes.user.id;
                setUserId(uid);
                const res = await ApiService.getUserWishlist(uid);
                const ids = new Set((res.wishlistList || []).map(w => w.roomId));
                setWishlisted(ids);
            } catch (_) {}
        };
        fetchWishlist();
    }, [isUser]);

    const handleWishlist = async (e, roomId) => {
        e.stopPropagation();
        if (!userId) { navigate('/login'); return; }
        try {
            await ApiService.toggleWishlist(userId, roomId);
            setWishlisted(prev => {
                const next = new Set(prev);
                next.has(roomId) ? next.delete(roomId) : next.add(roomId);
                return next;
            });
        } catch (_) {}
    };

    return (
        <section className="room-results">
            {roomSearchResults && roomSearchResults.length > 0 && (
                <div className={layout === 'grid' ? 'room-grid' : 'room-list'}>
                    {roomSearchResults.map(room => {
                        const badge = getAvailabilityBadge(room.availableCount, room.totalInventory);
                        const topAmenities = room.amenities ? room.amenities.slice(0, 4) : [];
                        const extraCount = room.amenities ? room.amenities.length - 4 : 0;
                        const isWishlisted = wishlisted.has(room.id);
                        return (
                            <div key={room.id} className={layout === 'grid' ? 'room-grid-item' : 'room-list-item'}>
                                <div className="room-list-item-image-wrapper">
                                    <img className='room-list-item-image' src={room.roomPhotoUrl} alt={room.roomType} />
                                    {badge && (
                                        <span className={`availability-badge ${badge.cls}`}>{badge.text}</span>
                                    )}
                                    {(isUser || !isAdmin) && (
                                        <button
                                            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                            onClick={(e) => handleWishlist(e, room.id)}
                                            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                                        >
                                            {isWishlisted ? '❤️' : '🤍'}
                                        </button>
                                    )}
                                </div>
                                <div className="room-details">
                                    <h3>{room.roomName || room.roomType}</h3>
                                    {room.roomName && <p className="room-type-tag">{room.roomType}</p>}
                                    {room.location && <p className="room-location-tag">📍 {room.location}</p>}
                                    <p className="room-price-tag">₹{room.roomPrice} / night</p>
                                    <p>{room.roomDescription}</p>
                                    {topAmenities.length > 0 && (
                                        <div className="amenity-chips">
                                            {topAmenities.map(a => (
                                                <span key={a.id} className="amenity-chip" title={a.name}>
                                                    {AMENITY_ICONS[a.iconKey] || '✓'} {a.name}
                                                </span>
                                            ))}
                                            {extraCount > 0 && (
                                                <span className="amenity-chip amenity-chip-more">+{extraCount} more</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className='book-now-div'>
                                    {isAdmin ? (
                                        <button
                                            className="edit-room-button"
                                            onClick={() => navigate(`/admin/edit-room/${room.id}`)}
                                        >
                                            Edit Room
                                        </button>
                                    ) : (
                                        <button
                                            className="book-now-button"
                                            onClick={() => navigate(`/room-details-book/${room.id}`)}
                                            disabled={room.totalInventory > 0 && room.availableCount === 0}
                                        >
                                            {room.totalInventory > 0 && room.availableCount === 0 ? 'Sold Out' : 'View / Book'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default RoomResult;
