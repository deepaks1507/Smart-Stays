package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentDTO {

    private Long id;
    private BigDecimal amount;
    private String currency;
    private String paymentGateway;
    private String gatewayTxnId;
    private String status;
    private LocalDateTime paidAt;
    private BigDecimal refundAmount;
    private LocalDateTime refundedAt;

    // booking info
    private Long bookingId;
    private String bookingConfirmationCode;

    // user info
    private String userName;
    private String userEmail;

    // room info
    private String roomType;
    private String roomLocation;
}
