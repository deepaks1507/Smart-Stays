package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LocationDTO {
    private Long id;
    private String name;
    private Boolean isActive;
}
