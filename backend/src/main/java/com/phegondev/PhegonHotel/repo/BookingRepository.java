package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingConfirmationCode(String confirmationCode);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate")
    long countOverlappingBookings(@Param("roomId") Long roomId,
                                  @Param("checkInDate") LocalDate checkInDate,
                                  @Param("checkOutDate") LocalDate checkOutDate);
}
