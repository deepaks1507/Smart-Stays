package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewDTO {

    private Long id;
    private int rating;
    private String comment;
    private String adminReply;
    private LocalDateTime createdAt;
    private String userName;
    private Long roomId;
    private Long bookingId;
}
