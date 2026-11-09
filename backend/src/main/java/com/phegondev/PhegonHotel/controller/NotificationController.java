package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.service.interfac.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private INotificationService notificationService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> getUserNotifications(@PathVariable Long userId) {
        Response response = notificationService.getUserNotifications(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/mark-read/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> markAllRead(@PathVariable Long userId) {
        Response response = notificationService.markAllRead(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/unread-count/{userId}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('USER')")
    public ResponseEntity<Response> getUnreadCount(@PathVariable Long userId) {
        Response response = notificationService.getUnreadCount(userId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
