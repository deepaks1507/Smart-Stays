package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Coupon;
import com.phegondev.PhegonHotel.service.interfac.ICouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/coupons")
public class CouponController {

    @Autowired
    private ICouponService couponService;

    @GetMapping("/validate")
    public ResponseEntity<Response> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal amount) {
        Response response = couponService.validateCoupon(code, amount);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllCoupons() {
        Response response = couponService.getAllCoupons();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createCoupon(@RequestBody Coupon coupon) {
        Response response = couponService.createCoupon(coupon);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{couponId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteCoupon(@PathVariable Long couponId) {
        Response response = couponService.deleteCoupon(couponId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/toggle/{couponId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> toggleCouponActive(@PathVariable Long couponId) {
        Response response = couponService.toggleCouponActive(couponId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
