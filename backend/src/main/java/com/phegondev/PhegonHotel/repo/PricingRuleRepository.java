package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    List<PricingRule> findByRoomId(Long roomId);
}
