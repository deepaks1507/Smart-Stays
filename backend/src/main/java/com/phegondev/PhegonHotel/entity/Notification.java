package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type;    // BOOKING_CONFIRM | REMINDER | OFFER | CANCELLATION

    private String channel; // EMAIL | SMS | IN_APP

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private boolean isRead = false;

    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) sentAt = LocalDateTime.now();
    }
}
