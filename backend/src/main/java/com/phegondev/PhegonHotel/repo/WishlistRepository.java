package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserIdAndRoomId(Long userId, Long roomId);
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
}
