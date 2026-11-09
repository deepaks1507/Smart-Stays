package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    List<Amenity> findByCategory(String category);
}
