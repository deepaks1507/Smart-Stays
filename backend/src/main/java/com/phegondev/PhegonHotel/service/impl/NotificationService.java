package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.NotificationDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Notification;
import com.phegondev.PhegonHotel.entity.User;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.NotificationRepository;
import com.phegondev.PhegonHotel.repo.UserRepository;
import com.phegondev.PhegonHotel.service.interfac.INotificationService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService implements INotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Response getUserNotifications(Long userId) {
        Response response = new Response();
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderBySentAtDesc(userId);
            List<NotificationDTO> dtoList = notifications.stream()
                    .map(Utils::mapNotificationEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setNotificationList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching notifications: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response markAllRead(Long userId) {
        Response response = new Response();
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderBySentAtDesc(userId);
            notifications.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(notifications);
            response.setStatusCode(200);
            response.setMessage("All notifications marked as read");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error marking notifications as read: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getUnreadCount(Long userId) {
        Response response = new Response();
        try {
            long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setUnreadCount(count);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching unread count: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response createNotification(Long userId, String type, String title, String message) {
        Response response = new Response();
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new OurException("User Not Found"));
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setChannel("IN_APP");
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRead(false);
            Notification saved = notificationRepository.save(notification);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setNotification(Utils.mapNotificationEntityToDTO(saved));
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating notification: " + e.getMessage());
        }
        return response;
    }
}
