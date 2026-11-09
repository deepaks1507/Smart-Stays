package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.CouponDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Coupon;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.CouponRepository;
import com.phegondev.PhegonHotel.service.interfac.ICouponService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService implements ICouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Override
    public Response validateCoupon(String code, BigDecimal bookingAmount) {
        Response response = new Response();
        try {
            Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                    .orElseThrow(() -> new OurException("Invalid or inactive coupon"));

            LocalDate today = LocalDate.now();
            if (today.isBefore(coupon.getValidFrom()) || today.isAfter(coupon.getValidUntil())) {
                throw new OurException("Coupon has expired");
            }

            if (coupon.getTimesUsed() >= coupon.getUsageLimit()) {
                throw new OurException("Coupon usage limit reached");
            }

            if (bookingAmount.compareTo(coupon.getMinBookingAmount()) < 0) {
                throw new OurException("Minimum booking amount not met");
            }

            BigDecimal discountAmount;
            if (coupon.getDiscountType() == Coupon.DiscountType.PERCENT) {
                discountAmount = bookingAmount
                        .multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
                if (coupon.getMaxDiscountCap() != null) {
                    discountAmount = discountAmount.min(coupon.getMaxDiscountCap());
                }
            } else {
                // FLAT
                discountAmount = coupon.getDiscountValue().min(bookingAmount);
            }

            CouponDTO dto = Utils.mapCouponEntityToDTO(coupon);
            dto.setDiscountAmount(discountAmount);

            response.setStatusCode(200);
            response.setMessage("Coupon applied successfully");
            response.setCoupon(dto);

        } catch (OurException e) {
            response.setStatusCode(400);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error validating coupon: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAllCoupons() {
        Response response = new Response();
        try {
            List<Coupon> coupons = couponRepository.findAll();
            List<CouponDTO> dtos = coupons.stream()
                    .map(Utils::mapCouponEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setCouponList(dtos);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching coupons: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response createCoupon(Coupon coupon) {
        Response response = new Response();
        try {
            Coupon saved = couponRepository.save(coupon);
            response.setStatusCode(200);
            response.setMessage("Coupon created successfully");
            response.setCoupon(Utils.mapCouponEntityToDTO(saved));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating coupon: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteCoupon(Long couponId) {
        Response response = new Response();
        try {
            couponRepository.findById(couponId)
                    .orElseThrow(() -> new OurException("Coupon Not Found"));
            couponRepository.deleteById(couponId);
            response.setStatusCode(200);
            response.setMessage("Coupon deleted successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting coupon: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response toggleCouponActive(Long couponId) {
        Response response = new Response();
        try {
            Coupon coupon = couponRepository.findById(couponId)
                    .orElseThrow(() -> new OurException("Coupon Not Found"));
            coupon.setActive(!coupon.isActive());
            Coupon saved = couponRepository.save(coupon);
            response.setStatusCode(200);
            response.setMessage("Coupon status updated successfully");
            response.setCoupon(Utils.mapCouponEntityToDTO(saved));
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error toggling coupon: " + e.getMessage());
        }
        return response;
    }
}
