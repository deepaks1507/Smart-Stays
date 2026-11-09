package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue;

    @Column(nullable = false)
    private BigDecimal minBookingAmount = BigDecimal.ZERO;

    private BigDecimal maxDiscountCap; // null = no cap

    @Column(nullable = false)
    private LocalDate validFrom;

    @Column(nullable = false)
    private LocalDate validUntil;

    @Column(nullable = false)
    private int usageLimit = 1;

    @Column(nullable = false)
    private int timesUsed = 0;

    @Column(nullable = false)
    private boolean isActive = true;

    public enum DiscountType {
        PERCENT, FLAT
    }
}
