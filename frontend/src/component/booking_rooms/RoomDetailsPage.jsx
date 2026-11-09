import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import DatePicker from 'react-datepicker';
import ReviewList from '../review/ReviewList';
// import 'react-datepicker/dist/react-datepicker.css';

const AMENITY_ICONS = {
  wifi: '📶', ac: '❄️', tv: '📺', fridge: '🧊', room_service: '🛎️',
  bathroom: '🚿', shower: '🚿', jacuzzi: '🛁', pool: '🏊', gym: '🏋️',
  parking: '🅿️', restaurant: '🍽️', breakfast: '🍳', desk: '🖥️',
  locker: '🔒', laundry: '👕', security: '🔒', balcony: '🌅',
  kitchen: '🍴', iron: '👔',
};

const RoomDetailsPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [numRooms, setNumRooms] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [reviews, setReviews] = useState([]);

  // Meal plan state
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [mealPlanCost, setMealPlanCost] = useState(0);

  const getAvailabilityBadge = (availableCount, totalInventory) => {
    if (!totalInventory) return null;
    if (availableCount === 0) return { text: 'Sold Out', cls: 'badge-sold-out' };
    if (availableCount <= 3) return { text: `Only ${availableCount} rooms left!`, cls: 'badge-critical' };
    if (availableCount <= 5) return { text: `Hurry! ${availableCount} rooms left`, cls: 'badge-warning' };
    return { text: `${availableCount} rooms available`, cls: 'badge-available' };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [roomRes, mealRes, reviewsRes] = await Promise.all([
          ApiService.getRoomById(roomId),
          ApiService.getAllMealPlans(),
          ApiService.getReviewsByRoom(roomId),
        ]);
        setRoomDetails(roomRes.room);
        setMealPlans(mealRes.mealPlanList || []);
        setReviews(reviewsRes.reviewList || []);
        try {
          const userProfile = await ApiService.getUserProfile();
          setUserId(userProfile.user.id);
        } catch (_) {}
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setErrorMessage('Please select check-in and check-out dates.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (isNaN(numAdults) || numAdults < 1 || isNaN(numChildren) || numChildren < 0) {
      setErrorMessage('Please enter valid numbers for adults and children.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const totalDays = Math.round(Math.abs((endDate - startDate) / oneDay));
    const guests = numAdults + numChildren;

    const roomTotal = roomDetails.roomPrice * totalDays * numRooms;

    // Meal plan cost: price per person per day × total guests × nights × rooms
    let mealCost = 0;
    if (selectedMealPlan) {
      mealCost = selectedMealPlan.pricePerPersonPerDay * guests * totalDays * numRooms;
    }

    setTotalPrice(roomTotal + mealCost);
    setMealPlanCost(mealCost);
    setTotalGuests(guests);
  };

  const acceptBooking = () => {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const booking = {
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      numOfAdults: numAdults,
      numOfChildren: numChildren,
    };

    navigate('/payment', {
      state: {
        roomId,
        userId,
        booking,
        totalPrice,
        roomType: roomDetails.roomType,
        numRooms,
      }
    });
  };

  if (isLoading) {
    return <p className='room-detail-loading'>Loading room details...</p>;
  }

  if (error) {
    return <p className='room-detail-loading'>{error}</p>;
  }

  if (!roomDetails) {
    return <p className='room-detail-loading'>Room not found.</p>;
  }

  const { roomType, roomPrice, roomPhotoUrl, roomDescription: description, bookings } = roomDetails;
  const badge = getAvailabilityBadge(roomDetails.availableCount, roomDetails.totalInventory);

  return (
    <div className="room-details-booking">
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Hero image */}
      <div className="room-detail-hero">
        <img src={roomPhotoUrl} alt={roomType} className="room-details-image" />
        <div className="room-detail-hero-overlay" />
        <div className="room-detail-hero-info">
          <h2>{roomDetails.roomName || roomType}</h2>
          {roomDetails.roomName && <p style={{color:'rgba(255,255,255,0.8)', margin:'2px 0 4px', fontSize:'0.9rem'}}>{roomType}</p>}
          {roomDetails.location && <p style={{color:'rgba(255,255,255,0.75)', margin:'0 0 4px', fontSize:'0.85rem'}}>📍 {roomDetails.location}</p>}
          <span className="room-detail-hero-price">₹{roomPrice} / night</span>
          {badge && (
            <span className={`availability-badge ${badge.cls} badge-detail`} style={{marginLeft: 14}}>
              {badge.text}
            </span>
          )}
        </div>
      </div>

      {/* Body: description + booking card */}
      <div className="room-detail-body">
        <div className="room-detail-left">
          <p className="room-detail-description">{description}</p>

          {roomDetails.amenities && roomDetails.amenities.length > 0 && (
            <div className="amenities-section">
              <h4>Amenities</h4>
              <div className="amenity-chips">
                {roomDetails.amenities.map(a => (
                  <span key={a.id} className="amenity-chip" title={a.name}>
                    {AMENITY_ICONS[a.iconKey] || '✓'} {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Existing bookings intentionally not shown to protect guest privacy */}

          <div className="room-reviews-section">
            <h3>Guest Reviews</h3>
            <ReviewList reviews={reviews} />
          </div>
        </div>

        {/* Booking card */}
        <div className="booking-card">
          <h3>Book this room</h3>
          {!showDatePicker ? (
            <button className="book-now-button" onClick={() => setShowDatePicker(true)}>
              Select Dates to Book
            </button>
          ) : (
            <>
              <div className="date-picker-container">
                <DatePicker
                  className="detail-search-field"
                  selected={checkInDate}
                  onChange={(date) => {
                    setCheckInDate(date);
                    if (checkOutDate && date && checkOutDate <= date) setCheckOutDate(null);
                    setTotalPrice(0);
                  }}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={new Date()}
                  placeholderText="Check-in Date"
                  dateFormat="dd/MM/yyyy"
                />
                <DatePicker
                  className="detail-search-field"
                  selected={checkOutDate}
                  onChange={(date) => { setCheckOutDate(date); setTotalPrice(0); }}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                  placeholderText="Check-out Date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="guest-container">
                <div className="guest-div">
                  <label>Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max={roomDetails.availableCount || 1}
                    value={numRooms}
                    onChange={(e) => { setNumRooms(Math.max(1, parseInt(e.target.value) || 1)); setTotalPrice(0); }}
                  />
                </div>
                <div className="guest-div">
                  <label>Adults</label>
                  <input
                    type="number"
                    min="1"
                    value={numAdults}
                    onChange={(e) => { setNumAdults(parseInt(e.target.value)); setTotalPrice(0); }}
                  />
                </div>
                <div className="guest-div">
                  <label>Children</label>
                  <input
                    type="number"
                    min="0"
                    value={numChildren}
                    onChange={(e) => { setNumChildren(parseInt(e.target.value)); setTotalPrice(0); }}
                  />
                </div>
              </div>

              {/* Meal Plan selector */}
              {mealPlans.length > 0 && (
                <div className="meal-plan-section">
                  <label className="meal-plan-label">Meal Plan (optional)</label>
                  <div className="meal-plan-options">
                    <div
                      className={`meal-plan-option ${!selectedMealPlan ? 'meal-plan-selected' : ''}`}
                      onClick={() => { setSelectedMealPlan(null); setTotalPrice(0); }}
                    >
                      <span className="meal-plan-name">Room Only</span>
                      <span className="meal-plan-price">No meals</span>
                    </div>
                    {mealPlans.map(mp => (
                      <div
                        key={mp.id}
                        className={`meal-plan-option ${selectedMealPlan?.id === mp.id ? 'meal-plan-selected' : ''}`}
                        onClick={() => { setSelectedMealPlan(mp); setTotalPrice(0); }}
                        title={mp.description}
                      >
                        <span className="meal-plan-name">{mp.name}</span>
                        <span className="meal-plan-price">+₹{mp.pricePerPersonPerDay}/person/night</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="confirm-booking" onClick={handleConfirmBooking}>
                Check Price
              </button>
              <button className="go-back-button" onClick={() => { setShowDatePicker(false); setTotalPrice(0); }}>
                Cancel
              </button>
            </>
          )}

          {totalPrice > 0 && (
            <div className="total-price">
              <p>Room: ₹{roomDetails.roomPrice} × {numRooms} room{numRooms > 1 ? 's' : ''} = ₹{totalPrice - mealPlanCost}</p>
              {mealPlanCost > 0 && (
                <p>Meals ({selectedMealPlan?.name}): ₹{mealPlanCost}</p>
              )}
              <p><strong>Total: ₹{totalPrice}</strong></p>
              <p>Guests: {totalGuests} · Rooms: {numRooms}</p>
              <button onClick={acceptBooking} className="accept-booking">
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
