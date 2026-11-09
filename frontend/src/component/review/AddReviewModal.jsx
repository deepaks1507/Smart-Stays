import React, { useState } from 'react';
import ApiService from '../../service/ApiService';

const AddReviewModal = ({ bookingId, userId, onClose, onSubmitSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!comment.trim()) {
            setError('Please write a comment.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const response = await ApiService.addReview(bookingId, userId, { rating, comment });
            if (response.statusCode === 200) {
                onSubmitSuccess();
                onClose();
            } else {
                setError(response.message || 'Failed to submit review.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Leave a Review</h3>
                <div className="star-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    className="review-comment-input"
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />
                {error && <p className="error-message">{error}</p>}
                <div className="modal-actions">
                    <button className="submit-review-button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button className="cancel-button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default AddReviewModal;
