package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.PaymentDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Payment;
import com.phegondev.PhegonHotel.repo.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllPayments() {
        Response response = new Response();
        try {
            List<Payment> payments = paymentRepository.findAll();
            List<PaymentDTO> dtos = payments.stream().map(this::toDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setPaymentList(dtos);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching payments: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/report")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getPaymentReport() {
        Response response = new Response();
        try {
            List<Payment> payments = paymentRepository.findAll();
            List<PaymentDTO> dtos = payments.stream().map(this::toDTO).collect(Collectors.toList());

            BigDecimal totalRevenue = paymentRepository.sumSuccessfulPayments();

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setPaymentList(dtos);
            response.setTotalRevenue(totalRevenue);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching payment report: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAnalytics() {
        Response response = new Response();
        try {
            List<Payment> all = paymentRepository.findAll();

            // --- Monthly revenue (last 12 months labels + amounts) ---
            List<Object[]> monthlyRaw = paymentRepository.revenueByMonth();
            List<Map<String, Object>> monthly = new ArrayList<>();
            String[] MONTHS = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
            for (Object[] row : monthlyRaw) {
                Map<String, Object> m = new LinkedHashMap<>();
                int yr  = ((Number) row[0]).intValue();
                int mo  = ((Number) row[1]).intValue();
                m.put("label", MONTHS[mo - 1] + " " + yr);
                m.put("amount", row[2]);
                monthly.add(m);
            }

            // --- Status breakdown ---
            Map<String, Long> statusCount = new LinkedHashMap<>();
            for (Object[] row : paymentRepository.countByStatus()) {
                String status = row[0] != null ? row[0].toString() : "UNKNOWN";
                statusCount.put(status, ((Number) row[1]).longValue());
            }

            // --- Revenue by room type ---
            Map<String, BigDecimal> byRoomType = new LinkedHashMap<>();
            for (Payment p : all) {
                if (p.getStatus() == Payment.PaymentStatus.SUCCESS && p.getBooking() != null && p.getBooking().getRoom() != null) {
                    String type = p.getBooking().getRoom().getRoomType();
                    byRoomType.merge(type, p.getAmount(), BigDecimal::add);
                }
            }

            // --- Revenue by location ---
            Map<String, BigDecimal> byLocation = new LinkedHashMap<>();
            for (Payment p : all) {
                if (p.getStatus() == Payment.PaymentStatus.SUCCESS && p.getBooking() != null && p.getBooking().getRoom() != null) {
                    String loc = p.getBooking().getRoom().getLocation();
                    if (loc == null || loc.isBlank()) loc = "Unknown";
                    byLocation.merge(loc, p.getAmount(), BigDecimal::add);
                }
            }

            // --- Top 5 guests by spend ---
            Map<String, BigDecimal> guestSpend = new LinkedHashMap<>();
            for (Payment p : all) {
                if (p.getStatus() == Payment.PaymentStatus.SUCCESS && p.getBooking() != null && p.getBooking().getUser() != null) {
                    String name = p.getBooking().getUser().getName();
                    guestSpend.merge(name, p.getAmount(), BigDecimal::add);
                }
            }
            List<Map<String, Object>> topGuests = guestSpend.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> { Map<String, Object> g = new HashMap<>(); g.put("name", e.getKey()); g.put("amount", e.getValue()); return g; })
                .collect(Collectors.toList());

            // --- Summary totals ---
            BigDecimal totalRevenue = paymentRepository.sumSuccessfulPayments();
            long totalTxns   = all.size();
            long successTxns = all.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCESS).count();
            long failedTxns  = all.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.FAILED).count();
            long pendingTxns = all.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING).count();
            long refundTxns  = all.stream().filter(p -> p.getStatus() == Payment.PaymentStatus.REFUNDED).count();

            Map<String, Object> analytics = new HashMap<>();
            analytics.put("monthlyRevenue",  monthly);
            analytics.put("statusBreakdown", statusCount);
            analytics.put("revenueByType",   byRoomType);
            analytics.put("revenueByLocation", byLocation);
            analytics.put("topGuests",       topGuests);
            analytics.put("totalRevenue",    totalRevenue);
            analytics.put("totalTxns",       totalTxns);
            analytics.put("successTxns",     successTxns);
            analytics.put("failedTxns",      failedTxns);
            analytics.put("pendingTxns",     pendingTxns);
            analytics.put("refundTxns",      refundTxns);

            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAnalyticsData(analytics);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching analytics: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    private PaymentDTO toDTO(Payment p) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(p.getId());
        dto.setAmount(p.getAmount());
        dto.setCurrency(p.getCurrency());
        dto.setPaymentGateway(p.getPaymentGateway());
        dto.setGatewayTxnId(p.getGatewayTxnId());
        dto.setStatus(p.getStatus() != null ? p.getStatus().name() : null);
        dto.setPaidAt(p.getPaidAt());
        dto.setRefundAmount(p.getRefundAmount());
        dto.setRefundedAt(p.getRefundedAt());
        if (p.getBooking() != null) {
            dto.setBookingId(p.getBooking().getId());
            dto.setBookingConfirmationCode(p.getBooking().getBookingConfirmationCode());
            if (p.getBooking().getUser() != null) {
                dto.setUserName(p.getBooking().getUser().getName());
                dto.setUserEmail(p.getBooking().getUser().getEmail());
            }
            if (p.getBooking().getRoom() != null) {
                dto.setRoomType(p.getBooking().getRoom().getRoomType());
                dto.setRoomLocation(p.getBooking().getRoom().getLocation());
            }
        }
        return dto;
    }
}
