package com.phegondev.PhegonHotel.controller;


import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.service.interfac.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {


    @Autowired
    private IUserService userService;


    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllUsers() {
        Response response = userService.getAllUsers();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-by-id/{userId}")
    public ResponseEntity<Response> getUserById(@PathVariable("userId") String userId) {
        Response response = userService.getUserById(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> deleteUSer(@PathVariable("userId") String userId) {
        // Service layer validates that a USER can only delete their own account
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String callerEmail = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        if (!isAdmin) {
            // Verify user is deleting their own account
            Response checkResponse = userService.getMyInfo(callerEmail);
            if (checkResponse.getUser() == null || !String.valueOf(checkResponse.getUser().getId()).equals(userId)) {
                Response forbidden = new Response();
                forbidden.setStatusCode(403);
                forbidden.setMessage("You can only delete your own account");
                return ResponseEntity.status(403).body(forbidden);
            }
        }
        Response response = userService.deleteUser(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-logged-in-profile-info")
    public ResponseEntity<Response> getLoggedInUserProfile() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Response response = userService.getMyInfo(email);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/get-user-bookings/{userId}")
    public ResponseEntity<Response> getUserBookingHistory(@PathVariable("userId") String userId) {
        Response response = userService.getUserBookingHistory(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }


}
