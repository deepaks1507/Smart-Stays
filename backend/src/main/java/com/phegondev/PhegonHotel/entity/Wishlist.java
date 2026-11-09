package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "wishlist",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "room_id"}))
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    private LocalDateTime savedAt;

    @PrePersist
    protected void onCreate() {
        if (savedAt == null) savedAt = LocalDateTime.now();
    }
}
