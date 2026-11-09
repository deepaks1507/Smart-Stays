package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MealPlanDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal pricePerPersonPerDay;
}
