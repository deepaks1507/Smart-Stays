package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRoomId(Long roomId);

    List<Review> findByUserId(Long userId);

    boolean existsByBookingId(Long bookingId);
}
