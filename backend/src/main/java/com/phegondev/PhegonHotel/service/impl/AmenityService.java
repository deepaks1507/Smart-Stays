package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.AmenityDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Amenity;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.AmenityRepository;
import com.phegondev.PhegonHotel.repo.RoomRepository;
import com.phegondev.PhegonHotel.service.interfac.IAmenityService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmenityService implements IAmenityService {

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Response getAllAmenities() {
        Response response = new Response();
        try {
            List<Amenity> amenities = amenityRepository.findAll();
            List<AmenityDTO> dtoList = amenities.stream()
                    .map(Utils::mapAmenityEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAmenityList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching amenities: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getAmenitiesByCategory(String category) {
        Response response = new Response();
        try {
            List<Amenity> amenities = amenityRepository.findByCategory(category);
            List<AmenityDTO> dtoList = amenities.stream()
                    .map(Utils::mapAmenityEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAmenityList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching amenities by category: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response createAmenity(Amenity amenity) {
        Response response = new Response();
        try {
            Amenity saved = amenityRepository.save(amenity);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setAmenity(Utils.mapAmenityEntityToDTO(saved));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating amenity: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteAmenity(Long id) {
        Response response = new Response();
        try {
            amenityRepository.findById(id)
                    .orElseThrow(() -> new OurException("Amenity Not Found"));
            amenityRepository.deleteById(id);
            response.setStatusCode(200);
            response.setMessage("successful");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting amenity: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response assignAmenityToRoom(Long roomId, Long amenityId) {
        Response response = new Response();
        try {
            Room room = roomRepository.findByIdWithAmenities(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));
            Amenity amenity = amenityRepository.findById(amenityId)
                    .orElseThrow(() -> new OurException("Amenity Not Found"));
            room.getAmenities().add(amenity);
            roomRepository.save(room);
            response.setStatusCode(200);
            response.setMessage("Amenity assigned to room successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error assigning amenity to room: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response removeAmenityFromRoom(Long roomId, Long amenityId) {
        Response response = new Response();
        try {
            Room room = roomRepository.findByIdWithAmenities(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));
            Amenity amenity = amenityRepository.findById(amenityId)
                    .orElseThrow(() -> new OurException("Amenity Not Found"));
            room.getAmenities().remove(amenity);
            roomRepository.save(room);
            response.setStatusCode(200);
            response.setMessage("Amenity removed from room successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error removing amenity from room: " + e.getMessage());
        }
        return response;
    }
}
