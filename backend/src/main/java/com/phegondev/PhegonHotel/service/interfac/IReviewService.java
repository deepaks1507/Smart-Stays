package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.ReviewRequest;

public interface IReviewService {

    Response addReview(Long bookingId, Long userId, ReviewRequest request);

    Response getReviewsByRoom(Long roomId);

    Response getReviewsByUser(Long userId);

    Response addAdminReply(Long reviewId, String reply);
}
