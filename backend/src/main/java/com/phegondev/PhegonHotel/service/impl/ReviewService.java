package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.ReviewRequest;
import com.phegondev.PhegonHotel.entity.Booking;
import com.phegondev.PhegonHotel.entity.Review;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.BookingRepository;
import com.phegondev.PhegonHotel.repo.ReviewRepository;
import com.phegondev.PhegonHotel.service.interfac.IReviewService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReviewService implements IReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public Response addReview(Long bookingId, Long userId, ReviewRequest request) {
        Response response = new Response();
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new OurException("Booking Not Found"));

            if (!booking.getUser().getId().equals(userId)) {
                throw new OurException("Unauthorized: You can only review your own bookings");
            }

            if (!LocalDate.now().isAfter(booking.getCheckOutDate())) {
                throw new OurException("Cannot review before check-out date");
            }

            if (reviewRepository.existsByBookingId(bookingId)) {
                throw new OurException("Review already submitted for this booking");
            }

            Review review = new Review();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            review.setUser(booking.getUser());
            review.setRoom(booking.getRoom());
            review.setBooking(booking);

            Review savedReview = reviewRepository.save(review);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setReview(Utils.mapReviewEntityToReviewDTO(savedReview));

        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding review: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getReviewsByRoom(Long roomId) {
        Response response = new Response();
        try {
            List<Review> reviews = reviewRepository.findByRoomId(roomId);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setReviewList(Utils.mapReviewListEntityToReviewListDTO(reviews));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching reviews: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getReviewsByUser(Long userId) {
        Response response = new Response();
        try {
            List<Review> reviews = reviewRepository.findByUserId(userId);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setReviewList(Utils.mapReviewListEntityToReviewListDTO(reviews));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching reviews: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response addAdminReply(Long reviewId, String reply) {
        Response response = new Response();
        try {
            Review review = reviewRepository.findById(reviewId)
                    .orElseThrow(() -> new OurException("Review Not Found"));

            review.setAdminReply(reply);
            Review savedReview = reviewRepository.save(review);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setReview(Utils.mapReviewEntityToReviewDTO(savedReview));

        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding reply: " + e.getMessage());
        }
        return response;
    }
}
