package com.phegondev.PhegonHotel.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "INR";

    private String paymentGateway; // RAZORPAY | STRIPE | MOCK

    private String gatewayTxnId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    private LocalDateTime paidAt;

    private BigDecimal refundAmount;

    private LocalDateTime refundedAt;

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED, REFUNDED
    }
}
