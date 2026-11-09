package com.phegondev.PhegonHotel.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "rooms")
public class Room {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String roomType;
    private String roomName;
    private BigDecimal roomPrice;
    private String roomPhotoUrl;
    private String roomDescription;
    private int totalInventory;
    private String location;

    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PricingRule> pricingRules = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_amenities",
        joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private List<Amenity> amenities = new ArrayList<>();
    @OneToMany(mappedBy = "room", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();


    @Override
    public String toString() {
        return "Room{" +
                "id=" + id +
                ", roomType='" + roomType + '\'' +
                ", roomPrice=" + roomPrice +
                ", roomPhotoUrl='" + roomPhotoUrl + '\'' +
                ", roomDescription='" + roomDescription + '\'' +
                '}';
    }
}
