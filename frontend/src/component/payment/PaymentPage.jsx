import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank', 'Punjab National Bank', 'Bank of Baroda'];

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [payMethod, setPayMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'

  // Card fields
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);

  // UPI
  const [upiId, setUpiId] = useState('');

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('');

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discount, setDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);

  if (!state || !state.booking) {
    return (
      <div className="payment-page">
        <p className="error-message">No booking details found. Please start a new booking.</p>
        <button className="go-back-button" onClick={() => navigate('/rooms')}>Back to Rooms</button>
      </div>
    );
  }

  const { roomId, userId, booking, totalPrice, roomType } = state;
  const finalPrice = Math.max(0, totalPrice - discount);
  const taxes = +(finalPrice * 0.12).toFixed(2);
  const grandTotal = +(finalPrice + taxes).toFixed(2);

  // ── Coupon ──────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await ApiService.validateCoupon(couponCode.trim(), totalPrice);
      if (res.statusCode === 200) {
        const d = Number(res.coupon?.discountAmount || 0);
        setDiscount(d);
        setCouponSuccess(`Coupon applied! You save ₹${d.toFixed(2)}`);
        setCouponApplied(true);
      }
    } catch (e) {
      setCouponError(e.response?.data?.message || 'Invalid or expired coupon.');
      setDiscount(0);
      setCouponApplied(false);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setCouponSuccess('');
    setCouponError('');
    setCouponApplied(false);
  };

  // ── Card formatters ──────────────────────────────────
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const getCardNetwork = () => {
    const d = cardNumber.replace(/\s/g, '');
    if (d.startsWith('4')) return 'VISA';
    if (d.startsWith('5')) return 'MASTERCARD';
    if (d.startsWith('6')) return 'RUPAY';
    return '';
  };

  // ── Validation ──────────────────────────────────────
  const validate = () => {
    if (payMethod === 'card') {
      if (!cardHolder.trim()) return 'Please enter the cardholder name.';
      if (/\d/.test(cardHolder)) return 'Cardholder name must not contain digits.';
      const digits = cardNumber.replace(/\s/g, '');
      if (digits.length !== 16) return 'Card number must be 16 digits.';
      if (!/^\d{2}\/\d{2}$/.test(expiry)) return 'Expiry must be in MM/YY format.';
      const [mm, yy] = expiry.split('/').map(Number);
      if (mm < 1 || mm > 12) return 'Invalid expiry month.';
      const now = new Date();
      if (new Date(2000 + yy, mm - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1)) return 'Card has expired.';
      if (cvv.length < 3) return 'CVV must be 3 or 4 digits.';
    } else if (payMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) return 'Please enter a valid UPI ID (e.g. name@upi).';
    } else if (payMethod === 'netbanking') {
      if (!selectedBank) return 'Please select a bank.';
    }
    return null;
  };

  // ── Pay ─────────────────────────────────────────────
  const handlePayment = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    setProcessing(true);
    setErrorMessage('');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setProcessing(false);
    }
  };

  // ── Nights ──────────────────────────────────────────
  const nights = (() => {
    if (!booking.checkInDate || !booking.checkOutDate) return 1;
    const diff = new Date(booking.checkOutDate) - new Date(booking.checkInDate);
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  })();

  // ── Success screen ───────────────────────────────────
  if (confirmationCode) {
    return (
      <div className="payment-page">
        <div className="payment-success">
          <div className="payment-success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p className="payment-success-subtitle">Your stay at SmartStays is all set.</p>
          <div className="payment-receipt">
            <div className="receipt-row"><span>Room</span><strong>{roomType}</strong></div>
            <div className="receipt-row"><span>Check-in</span><strong>{booking.checkInDate}</strong></div>
            <div className="receipt-row"><span>Check-out</span><strong>{booking.checkOutDate}</strong></div>
            <div className="receipt-row"><span>Guests</span><strong>{booking.numOfAdults + booking.numOfChildren}</strong></div>
            <div className="receipt-divider"/>
            <div className="receipt-row receipt-total"><span>Total Charged</span><strong>₹{grandTotal.toFixed(2)}</strong></div>
            <div className="receipt-row"><span>Confirmation Code</span><strong className="receipt-code">{confirmationCode}</strong></div>
          </div>
          <p className="payment-note">A confirmation email has been sent to you.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="accept-booking" onClick={() => navigate('/profile')}>View My Bookings</button>
            <button className="go-back-button" onClick={() => navigate('/rooms')}>Back to Rooms</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h2>Complete Your Booking</h2>

      <div className="payment-container">
        {/* ── LEFT: Order Summary ── */}
        <div className="payment-summary">
          <h3>Order Summary</h3>

          <div className="order-room-header">
            <div className="order-room-type">{roomType}</div>
            <div className="order-nights-badge">{nights} night{nights !== 1 ? 's' : ''}</div>
          </div>

          <div className="receipt-row"><span>Check-in</span><span>{booking.checkInDate}</span></div>
          <div className="receipt-row"><span>Check-out</span><span>{booking.checkOutDate}</span></div>
          <div className="receipt-row">
            <span>Guests</span>
            <span>{booking.numOfAdults} adult{booking.numOfAdults !== 1 ? 's' : ''}
              {booking.numOfChildren > 0 ? `, ${booking.numOfChildren} child` : ''}</span>
          </div>

          <div className="receipt-divider" style={{margin: '14px 0'}}/>

          <div className="receipt-row"><span>Room charges</span><span>₹{totalPrice.toFixed(2)}</span></div>
          {discount > 0 && (
            <div className="receipt-row receipt-discount">
              <span>Coupon discount</span><span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="receipt-row"><span>Taxes &amp; fees (12%)</span><span>₹{taxes.toFixed(2)}</span></div>
          <div className="receipt-divider" style={{margin: '10px 0'}}/>
          <div className="receipt-row receipt-total">
            <span>Total Payable</span><strong>₹{grandTotal.toFixed(2)}</strong>
          </div>

          {/* Coupon */}
          <div className="coupon-section">
            {!couponApplied ? (
              <>
                <p className="coupon-label">Have a promo code?</p>
                <div className="coupon-row">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    className="coupon-input"
                    disabled={processing}
                  />
                  <button className="coupon-apply-btn" onClick={handleApplyCoupon} disabled={applyingCoupon || processing}>
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="coupon-feedback coupon-feedback-error">✗ {couponError}</p>
                )}
              </>
            ) : (
              <div className="coupon-applied-row">
                <span className="coupon-applied-tag">
                  <span className="coupon-check">✓</span> {couponCode}
                </span>
                <span className="coupon-saving">-₹{discount.toFixed(2)}</span>
                <button className="coupon-remove-btn" onClick={handleRemoveCoupon} disabled={processing}>✕</button>
              </div>
            )}
            {couponSuccess && !couponError && couponApplied && (
              <p className="coupon-feedback coupon-feedback-success">{couponSuccess}</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Payment Form ── */}
        <div className="payment-form">
          <h3>Payment Details</h3>

          {/* Method tabs */}
          <div className="pay-method-tabs">
            {[
              { id: 'card', label: '💳 Card' },
              { id: 'upi',  label: '📱 UPI' },
              { id: 'netbanking', label: '🏦 Net Banking' },
            ].map(m => (
              <button
                key={m.id}
                className={`pay-method-tab ${payMethod === m.id ? 'active' : ''}`}
                onClick={() => { setPayMethod(m.id); setErrorMessage(''); }}
                disabled={processing}
              >
                {m.label}
              </button>
            ))}
          </div>

          {errorMessage && <p className="error-message" style={{marginBottom: 12}}>{errorMessage}</p>}

          {/* ── Card ── */}
          {payMethod === 'card' && (
            <>
              <div className={`payment-card-preview ${cardFlipped ? 'flipped' : ''}`}>
                <div className="card-inner">
                  <div className="card-front">
                    <div className="card-top-row">
                      <div className="card-chip" />
                      <span className="card-network">{getCardNetwork()}</span>
                    </div>
                    <div className="card-number-display">
                      {cardNumber || '**** **** **** ****'}
                    </div>
                    <div className="card-bottom">
                      <div>
                        <div style={{fontSize:9,opacity:.7,marginBottom:2,letterSpacing:1}}>CARD HOLDER</div>
                        <span className="card-holder-display">{cardHolder || 'YOUR NAME'}</span>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:9,opacity:.7,marginBottom:2,letterSpacing:1}}>EXPIRES</div>
                        <span className="card-expiry-display">{expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-back">
                    <div className="card-back-stripe" />
                    <div className="card-cvv-row">
                      <span className="card-cvv-label">CVV</span>
                      <span className="card-cvv-box">{cvv ? '•'.repeat(cvv.length) : '•••'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input type="text" placeholder="John Doe" value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  maxLength={26} disabled={processing} />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19} disabled={processing} />
              </div>
              <div className="payment-row">
                <div className="form-group">
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5} disabled={processing} />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input type="password" placeholder="•••" value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4} disabled={processing}
                    onFocus={() => setCardFlipped(true)}
                    onBlur={() => setCardFlipped(false)} />
                </div>
              </div>
            </>
          )}

          {/* ── UPI ── */}
          {payMethod === 'upi' && (
            <div className="upi-section">
              <div className="upi-logos">
                <span className="upi-logo">GPay</span>
                <span className="upi-logo">PhonePe</span>
                <span className="upi-logo">Paytm</span>
                <span className="upi-logo">BHIM</span>
              </div>
              <div className="form-group" style={{marginTop: 18}}>
                <label>UPI ID</label>
                <input type="text" placeholder="yourname@upi" value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={processing} />
              </div>
              <p className="upi-hint">Enter your UPI ID linked with any app</p>
            </div>
          )}

          {/* ── Net Banking ── */}
          {payMethod === 'netbanking' && (
            <div className="netbanking-section">
              <label className="nb-label">Select Your Bank</label>
              <div className="bank-grid">
                {BANKS.map(b => (
                  <div
                    key={b}
                    className={`bank-option ${selectedBank === b ? 'bank-selected' : ''}`}
                    onClick={() => !processing && setSelectedBank(b)}
                  >
                    <span className="bank-icon">🏦</span>
                    <span className="bank-name">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="payment-disclaimer">
            🔒 This is a demo payment gateway. Do not enter real credentials.
          </p>

          <button className="pay-button accept-booking" onClick={handlePayment} disabled={processing}>
            {processing ? 'Processing…' : `Pay ₹${grandTotal.toFixed(2)}`}
          </button>

          {!processing && (
            <button className="go-back-button" style={{width:'100%',marginTop:8}} onClick={() => navigate(-1)}>
              Cancel
            </button>
          )}

          {processing && (
            <div className="payment-processing">
              <div className="payment-spinner" />
              <p>Securely processing your payment…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
