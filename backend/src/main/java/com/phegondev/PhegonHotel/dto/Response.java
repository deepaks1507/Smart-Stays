package com.phegondev.PhegonHotel.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Response {

    private int statusCode;
    private String message;

    private String token;
    private String role;
    private String expirationTime;
    private String bookingConfirmationCode;

    private UserDTO user;
    private RoomDTO room;
    private BookingDTO booking;
    private List<UserDTO> userList;
    private List<RoomDTO> roomList;
    private List<BookingDTO> bookingList;

    private ReviewDTO review;
    private List<ReviewDTO> reviewList;

    private Map<String, Long> roomAvailabilitySummary;

    private WishlistDTO wishlist;
    private List<WishlistDTO> wishlistList;

    private CouponDTO coupon;
    private List<CouponDTO> couponList;
    private BigDecimal discountAmount;

    private NotificationDTO notification;
    private List<NotificationDTO> notificationList;
    private long unreadCount;

    private MealPlanDTO mealPlan;
    private List<MealPlanDTO> mealPlanList;

    private CancellationPolicyDTO cancellationPolicy;
    private List<CancellationPolicyDTO> cancellationPolicyList;

    private PricingRuleDTO pricingRule;
    private List<PricingRuleDTO> pricingRuleList;
    private BigDecimal effectivePrice;

    private AmenityDTO amenity;
    private List<AmenityDTO> amenityList;

    private PaymentDTO payment;
    private List<PaymentDTO> paymentList;
    private BigDecimal totalRevenue;
    private Map<String, Object> analyticsData;

    private LocationDTO location;
    private List<LocationDTO> locationList;

}
