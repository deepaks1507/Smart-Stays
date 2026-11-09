package com.phegondev.PhegonHotel.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomDTO {

    private Long id;
    private String roomType;
    private String roomName;
    private BigDecimal roomPrice;
    private String roomPhotoUrl;
    private String roomDescription;
    private int totalInventory;
    private int availableCount;
    private String location;
    private List<AmenityDTO> amenities;
    private List<BookingDTO> bookings;
}
