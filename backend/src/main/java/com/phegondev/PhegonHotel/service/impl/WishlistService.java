package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.dto.WishlistDTO;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.entity.User;
import com.phegondev.PhegonHotel.entity.Wishlist;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.RoomRepository;
import com.phegondev.PhegonHotel.repo.UserRepository;
import com.phegondev.PhegonHotel.repo.WishlistRepository;
import com.phegondev.PhegonHotel.service.interfac.IWishlistService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService implements IWishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Response toggleWishlist(Long userId, Long roomId) {
        Response response = new Response();
        try {
            if (wishlistRepository.existsByUserIdAndRoomId(userId, roomId)) {
                Wishlist existing = wishlistRepository.findByUserIdAndRoomId(userId, roomId)
                        .orElseThrow(() -> new OurException("Wishlist entry not found"));
                wishlistRepository.delete(existing);
                response.setStatusCode(200);
                response.setMessage("Removed from wishlist");
            } else {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new OurException("User Not Found"));
                Room room = roomRepository.findById(roomId)
                        .orElseThrow(() -> new OurException("Room Not Found"));

                Wishlist wishlist = new Wishlist();
                wishlist.setUser(user);
                wishlist.setRoom(room);

                Wishlist saved = wishlistRepository.save(wishlist);
                WishlistDTO dto = Utils.mapWishlistEntityToDTO(saved);

                response.setStatusCode(200);
                response.setMessage("Added to wishlist");
                response.setWishlist(dto);
            }
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error toggling wishlist: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getUserWishlist(Long userId) {
        Response response = new Response();
        try {
            List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
            List<WishlistDTO> dtos = wishlists.stream()
                    .map(Utils::mapWishlistEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setWishlistList(dtos);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching wishlist: " + e.getMessage());
        }
        return response;
    }
}
