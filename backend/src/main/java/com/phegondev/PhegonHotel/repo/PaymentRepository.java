package com.phegondev.PhegonHotel.repo;

import com.phegondev.PhegonHotel.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingId(Long bookingId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    BigDecimal sumSuccessfulPayments();

    @Query("SELECT p.status, COUNT(p) FROM Payment p GROUP BY p.status")
    List<Object[]> countByStatus();

    @Query("SELECT p.paymentGateway, COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' GROUP BY p.paymentGateway")
    List<Object[]> revenueByGateway();

    @Query("SELECT YEAR(p.paidAt), MONTH(p.paidAt), COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' AND p.paidAt IS NOT NULL GROUP BY YEAR(p.paidAt), MONTH(p.paidAt) ORDER BY YEAR(p.paidAt), MONTH(p.paidAt)")
    List<Object[]> revenueByMonth();
}
