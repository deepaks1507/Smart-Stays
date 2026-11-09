import React from 'react';

const ReviewList = ({ reviews = [] }) => {
    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>★</span>
        ));
    };

    if (reviews.length === 0) {
        return <p className="no-reviews">No reviews yet. Be the first to review!</p>;
    }

    return (
        <div className="review-list">
            {reviews.map((review) => (
                <div key={review.id} className="review-item">
                    <div className="review-header">
                        <span className="review-stars">{renderStars(review.rating)}</span>
                        <span className="review-author">{review.userName}</span>
                        <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {review.adminReply && (
                        <div className="admin-reply">
                            <strong>Hotel Response:</strong>
                            <p>{review.adminReply}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
