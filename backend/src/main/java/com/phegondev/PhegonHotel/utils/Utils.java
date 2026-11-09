package com.phegondev.PhegonHotel.utils;

import com.phegondev.PhegonHotel.dto.AmenityDTO;
import com.phegondev.PhegonHotel.dto.BookingDTO;
import com.phegondev.PhegonHotel.dto.CancellationPolicyDTO;
import com.phegondev.PhegonHotel.dto.CouponDTO;
import com.phegondev.PhegonHotel.dto.MealPlanDTO;
import com.phegondev.PhegonHotel.dto.NotificationDTO;
import com.phegondev.PhegonHotel.dto.PricingRuleDTO;
import com.phegondev.PhegonHotel.dto.ReviewDTO;
import com.phegondev.PhegonHotel.dto.RoomDTO;
import com.phegondev.PhegonHotel.dto.UserDTO;
import com.phegondev.PhegonHotel.dto.WishlistDTO;
import com.phegondev.PhegonHotel.entity.Amenity;
import com.phegondev.PhegonHotel.entity.Booking;
import com.phegondev.PhegonHotel.entity.CancellationPolicy;
import com.phegondev.PhegonHotel.entity.Coupon;
import com.phegondev.PhegonHotel.entity.MealPlan;
import com.phegondev.PhegonHotel.entity.Notification;
import com.phegondev.PhegonHotel.entity.PricingRule;
import com.phegondev.PhegonHotel.entity.Review;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.entity.User;
import com.phegondev.PhegonHotel.entity.Wishlist;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

public class Utils {

    private static final String ALPHANUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom secureRandom = new SecureRandom();


    public static String generateRandomConfirmationCode(int length) {
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int randomIndex = secureRandom.nextInt(ALPHANUMERIC_STRING.length());
            char randomChar = ALPHANUMERIC_STRING.charAt(randomIndex);
            stringBuilder.append(randomChar);
        }
        return stringBuilder.toString();
    }


    public static UserDTO mapUserEntityToUserDTO(User user) {
        UserDTO userDTO = new UserDTO();

        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setRole(user.getRole());
        return userDTO;
    }

    public static AmenityDTO mapAmenityEntityToDTO(Amenity amenity) {
        AmenityDTO dto = new AmenityDTO();
        dto.setId(amenity.getId());
        dto.setName(amenity.getName());
        dto.setIconKey(amenity.getIconKey());
        dto.setCategory(amenity.getCategory());
        return dto;
    }

    public static RoomDTO mapRoomEntityToRoomDTO(Room room) {
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setId(room.getId());
        roomDTO.setRoomType(room.getRoomType());
        roomDTO.setRoomName(room.getRoomName());
        roomDTO.setRoomPrice(room.getRoomPrice());
        roomDTO.setRoomPhotoUrl(room.getRoomPhotoUrl());
        roomDTO.setRoomDescription(room.getRoomDescription());
        roomDTO.setTotalInventory(room.getTotalInventory());
        roomDTO.setLocation(room.getLocation());
        if (room.getAmenities() != null && !room.getAmenities().isEmpty()) {
            roomDTO.setAmenities(room.getAmenities().stream()
                    .map(Utils::mapAmenityEntityToDTO).collect(Collectors.toList()));
        }
        return roomDTO;
    }

    public static BookingDTO mapBookingEntityToBookingDTO(Booking booking) {
        BookingDTO bookingDTO = new BookingDTO();
        // Map simple fields
        bookingDTO.setId(booking.getId());
        bookingDTO.setCheckInDate(booking.getCheckInDate());
        bookingDTO.setCheckOutDate(booking.getCheckOutDate());
        bookingDTO.setNumOfAdults(booking.getNumOfAdults());
        bookingDTO.setNumOfChildren(booking.getNumOfChildren());
        bookingDTO.setTotalNumOfGuest(booking.getTotalNumOfGuest());
        bookingDTO.setBookingConfirmationCode(booking.getBookingConfirmationCode());
        return bookingDTO;
    }

    public static RoomDTO mapRoomEntityToRoomDTOPlusBookings(Room room) {
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setId(room.getId());
        roomDTO.setRoomType(room.getRoomType());
        roomDTO.setRoomName(room.getRoomName());
        roomDTO.setRoomPrice(room.getRoomPrice());
        roomDTO.setRoomPhotoUrl(room.getRoomPhotoUrl());
        roomDTO.setRoomDescription(room.getRoomDescription());
        roomDTO.setTotalInventory(room.getTotalInventory());
        roomDTO.setLocation(room.getLocation());
        if (room.getAmenities() != null && !room.getAmenities().isEmpty()) {
            roomDTO.setAmenities(room.getAmenities().stream()
                    .map(Utils::mapAmenityEntityToDTO).collect(Collectors.toList()));
        }
        if (room.getBookings() != null) {
            roomDTO.setBookings(room.getBookings().stream()
                    .map(Utils::mapBookingEntityToBookingDTO).collect(Collectors.toList()));
        }
        return roomDTO;
    }

    public static BookingDTO mapBookingEntityToBookingDTOPlusBookedRooms(Booking booking, boolean mapUser) {

        BookingDTO bookingDTO = new BookingDTO();
        // Map simple fields
        bookingDTO.setId(booking.getId());
        bookingDTO.setCheckInDate(booking.getCheckInDate());
        bookingDTO.setCheckOutDate(booking.getCheckOutDate());
        bookingDTO.setNumOfAdults(booking.getNumOfAdults());
        bookingDTO.setNumOfChildren(booking.getNumOfChildren());
        bookingDTO.setTotalNumOfGuest(booking.getTotalNumOfGuest());
        bookingDTO.setBookingConfirmationCode(booking.getBookingConfirmationCode());
        if (mapUser) {
            bookingDTO.setUser(Utils.mapUserEntityToUserDTO(booking.getUser()));
        }
        if (booking.getRoom() != null) {
            RoomDTO roomDTO = new RoomDTO();

            roomDTO.setId(booking.getRoom().getId());
            roomDTO.setRoomType(booking.getRoom().getRoomType());
            roomDTO.setRoomName(booking.getRoom().getRoomName());
            roomDTO.setRoomPrice(booking.getRoom().getRoomPrice());
            roomDTO.setRoomPhotoUrl(booking.getRoom().getRoomPhotoUrl());
            roomDTO.setRoomDescription(booking.getRoom().getRoomDescription());
            roomDTO.setTotalInventory(booking.getRoom().getTotalInventory());
            roomDTO.setLocation(booking.getRoom().getLocation());
            bookingDTO.setRoom(roomDTO);
        }
        return bookingDTO;
    }

    public static UserDTO mapUserEntityToUserDTOPlusUserBookingsAndRoom(User user) {
        UserDTO userDTO = new UserDTO();

        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setRole(user.getRole());

        if (!user.getBookings().isEmpty()) {
            userDTO.setBookings(user.getBookings().stream().map(booking -> mapBookingEntityToBookingDTOPlusBookedRooms(booking, false)).collect(Collectors.toList()));
        }
        return userDTO;
    }


    public static List<UserDTO> mapUserListEntityToUserListDTO(List<User> userList) {
        return userList.stream().map(Utils::mapUserEntityToUserDTO).collect(Collectors.toList());
    }

    public static List<RoomDTO> mapRoomListEntityToRoomListDTO(List<Room> roomList) {
        return roomList.stream().map(Utils::mapRoomEntityToRoomDTO).collect(Collectors.toList());
    }

    public static List<BookingDTO> mapBookingListEntityToBookingListDTO(List<Booking> bookingList) {
        return bookingList.stream()
                .map(b -> mapBookingEntityToBookingDTOPlusBookedRooms(b, true))
                .collect(Collectors.toList());
    }

    public static ReviewDTO mapReviewEntityToReviewDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setAdminReply(review.getAdminReply());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setUserName(review.getUser().getName());
        dto.setRoomId(review.getRoom().getId());
        dto.setBookingId(review.getBooking().getId());
        return dto;
    }

    public static List<ReviewDTO> mapReviewListEntityToReviewListDTO(List<Review> reviews) {
        return reviews.stream().map(Utils::mapReviewEntityToReviewDTO).collect(Collectors.toList());
    }

    public static WishlistDTO mapWishlistEntityToDTO(Wishlist wishlist) {
        WishlistDTO dto = new WishlistDTO();
        dto.setId(wishlist.getId());
        dto.setSavedAt(wishlist.getSavedAt());
        if (wishlist.getRoom() != null) {
            dto.setRoomId(wishlist.getRoom().getId());
            dto.setRoomType(wishlist.getRoom().getRoomType());
            dto.setRoomPhotoUrl(wishlist.getRoom().getRoomPhotoUrl());
            dto.setRoomPrice(wishlist.getRoom().getRoomPrice());
        }
        return dto;
    }

    public static CouponDTO mapCouponEntityToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDiscountType(coupon.getDiscountType().name());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinBookingAmount(coupon.getMinBookingAmount());
        dto.setMaxDiscountCap(coupon.getMaxDiscountCap());
        dto.setValidFrom(coupon.getValidFrom());
        dto.setValidUntil(coupon.getValidUntil());
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setTimesUsed(coupon.getTimesUsed());
        dto.setActive(coupon.isActive());
        return dto;
    }

    public static NotificationDTO mapNotificationEntityToDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setChannel(n.getChannel());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setSentAt(n.getSentAt());
        return dto;
    }

    public static MealPlanDTO mapMealPlanEntityToDTO(MealPlan m) {
        MealPlanDTO dto = new MealPlanDTO();
        dto.setId(m.getId());
        dto.setCode(m.getCode());
        dto.setName(m.getName());
        dto.setDescription(m.getDescription());
        dto.setPricePerPersonPerDay(m.getPricePerPersonPerDay());
        return dto;
    }

    public static CancellationPolicyDTO mapCancellationPolicyEntityToDTO(CancellationPolicy cp) {
        CancellationPolicyDTO dto = new CancellationPolicyDTO();
        dto.setId(cp.getId());
        dto.setName(cp.getName());
        dto.setFreeCancel(cp.isFreeCancel());
        dto.setFreeCancellationHoursBefore(cp.getFreeCancellationHoursBefore());
        dto.setPartialRefundPercentage(cp.getPartialRefundPercentage());
        dto.setPartialRefundHoursThreshold(cp.getPartialRefundHoursThreshold());
        dto.setPolicyDescription(cp.getPolicyDescription());
        return dto;
    }

    public static PricingRuleDTO mapPricingRuleEntityToDTO(PricingRule pr) {
        PricingRuleDTO dto = new PricingRuleDTO();
        dto.setId(pr.getId());
        if (pr.getRoom() != null) {
            dto.setRoomId(pr.getRoom().getId());
        }
        dto.setLabel(pr.getLabel());
        dto.setStartDate(pr.getStartDate());
        dto.setEndDate(pr.getEndDate());
        dto.setDayOfWeek(pr.getDayOfWeek());
        dto.setPriceOverride(pr.getPriceOverride());
        dto.setPriceMultiplier(pr.getPriceMultiplier());
        return dto;
    }

}


