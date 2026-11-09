package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.service.interfac.IWishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private IWishlistService wishlistService;

    @PostMapping("/toggle")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<Response> toggleWishlist(
            @RequestParam Long userId,
            @RequestParam Long roomId) {
        Response response = wishlistService.toggleWishlist(userId, roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('USER') or hasAuthority('ADMIN')")
    public ResponseEntity<Response> getUserWishlist(@PathVariable Long userId) {
        Response response = wishlistService.getUserWishlist(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
