package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PricingRuleDTO {
    private Long id;
    private Long roomId;
    private String label;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer dayOfWeek;
    private BigDecimal priceOverride;
    private BigDecimal priceMultiplier;
}
