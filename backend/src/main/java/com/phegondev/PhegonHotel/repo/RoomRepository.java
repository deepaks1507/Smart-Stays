package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT DISTINCT r.roomType FROM Room r")
    List<String> findDistinctRoomTypes();

    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.amenities ORDER BY r.id DESC")
    List<Room> findAllWithAmenities();

    @Query("SELECT r FROM Room r LEFT JOIN FETCH r.amenities WHERE r.id = :id")
    Optional<Room> findByIdWithAmenities(@Param("id") Long id);

    @Query("SELECT DISTINCT r FROM Room r LEFT JOIN FETCH r.amenities WHERE r.roomType LIKE %:roomType% AND r.id NOT IN (SELECT bk.room.id FROM Booking bk WHERE" +
            "(bk.checkInDate <= :checkOutDate) AND (bk.checkOutDate >= :checkInDate))")
    List<Room> findAvailableRoomsByDatesAndTypes(LocalDate checkInDate, LocalDate checkOutDate, String roomType);


    @Query("SELECT r FROM Room r WHERE r.id NOT IN (SELECT b.room.id FROM Booking b)")
    List<Room> getAllAvailableRooms();

    @Query("SELECT r.roomType, COUNT(r) FROM Room r WHERE r.id NOT IN (SELECT b.room.id FROM Booking b) GROUP BY r.roomType")
    List<Object[]> countAvailableRoomsByType();
}
