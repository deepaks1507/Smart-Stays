package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IRoomService {

    Response addNewRoom(MultipartFile photo, String roomType, String roomName, BigDecimal roomPrice, String description, int totalInventory, String location);

    List<String> getAllRoomTypes();

    Response getAllRooms();

    Response deleteRoom(Long roomId);

    Response updateRoom(Long roomId, String description, String roomType, String roomName, BigDecimal roomPrice, MultipartFile photo, Integer totalInventory, String location);

    Response getRoomById(Long roomId);

    Response getAvailableRoomsByDataAndType(LocalDate checkInDate, LocalDate checkOutDate, String roomType);

    Response getAllAvailableRooms();

    Response getAvailabilityCountByType();
}
