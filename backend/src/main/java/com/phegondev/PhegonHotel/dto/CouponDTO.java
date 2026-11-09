package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CouponDTO {

    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minBookingAmount;
    private BigDecimal maxDiscountCap;
    private LocalDate validFrom;
    private LocalDate validUntil;
    private int usageLimit;
    private int timesUsed;
    private boolean isActive;

    // Calculated field — populated only in validate response
    private BigDecimal discountAmount;
}
