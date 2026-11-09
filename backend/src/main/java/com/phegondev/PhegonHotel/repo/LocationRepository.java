package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByIsActiveTrue();
}
