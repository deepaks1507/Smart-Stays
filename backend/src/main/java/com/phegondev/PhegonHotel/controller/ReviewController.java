package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.ReviewRequest;
import com.phegondev.PhegonHotel.service.interfac.IReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private IReviewService reviewService;

    @PostMapping("/add/{bookingId}")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<Response> addReview(
            @PathVariable Long bookingId,
            @RequestParam Long userId,
            @RequestBody ReviewRequest request) {
        Response response = reviewService.addReview(bookingId, userId, request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Response> getReviewsByRoom(@PathVariable Long roomId) {
        Response response = reviewService.getReviewsByRoom(roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<Response> getReviewsByUser(@PathVariable Long userId) {
        Response response = reviewService.getReviewsByUser(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/admin-reply/{reviewId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> addAdminReply(
            @PathVariable Long reviewId,
            @RequestParam String reply) {
        Response response = reviewService.addAdminReply(reviewId, reply);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
