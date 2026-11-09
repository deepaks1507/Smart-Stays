package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "pricing_rules")
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private String label; // WEEKEND | PEAK | FESTIVE | HOLIDAY

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer dayOfWeek; // 1=Mon .. 7=Sun, null = all days

    private BigDecimal priceOverride; // fixed price, takes precedence over multiplier

    private BigDecimal priceMultiplier; // e.g. 1.25 = 25% surge
}
