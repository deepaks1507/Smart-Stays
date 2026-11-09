package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "cancellation_policies")
public class CancellationPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private boolean isFreeCancel;

    private Integer freeCancellationHoursBefore;  // hours before check-in

    private Integer partialRefundPercentage;

    private Integer partialRefundHoursThreshold;

    @Column(columnDefinition = "TEXT")
    private String policyDescription;
}
