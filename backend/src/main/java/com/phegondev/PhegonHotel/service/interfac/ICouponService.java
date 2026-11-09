package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Coupon;

import java.math.BigDecimal;

public interface ICouponService {

    Response validateCoupon(String code, BigDecimal bookingAmount);

    Response getAllCoupons();

    Response createCoupon(Coupon coupon);

    Response deleteCoupon(Long couponId);

    Response toggleCouponActive(Long couponId);
}
