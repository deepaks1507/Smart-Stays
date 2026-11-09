package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;

public interface INotificationService {

    Response getUserNotifications(Long userId);

    Response markAllRead(Long userId);

    Response getUnreadCount(Long userId);

    Response createNotification(Long userId, String type, String title, String message);
}
