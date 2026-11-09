package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WishlistDTO {

    private Long id;
    private Long roomId;
    private String roomType;
    private String roomPhotoUrl;
    private BigDecimal roomPrice;
    private LocalDateTime savedAt;
}
