package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "amenities")
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String iconKey;
    private String category; // ROOM | PROPERTY | BATHROOM | TECH | FOOD

    @ManyToMany(mappedBy = "amenities", fetch = FetchType.LAZY)
    private List<Room> rooms = new ArrayList<>();
}
