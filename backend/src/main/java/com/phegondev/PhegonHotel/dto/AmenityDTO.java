package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AmenityDTO {
    private Long id;
    private String name;
    private String iconKey;
    private String category;
}
