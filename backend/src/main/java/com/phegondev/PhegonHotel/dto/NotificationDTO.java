package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDTO {
    private Long id;
    private String type;
    private String channel;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime sentAt;
}
