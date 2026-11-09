package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.CancellationPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, Long> {
}
