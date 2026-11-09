package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Amenity;

public interface IAmenityService {

    Response getAllAmenities();

    Response getAmenitiesByCategory(String category);

    Response createAmenity(Amenity amenity);

    Response deleteAmenity(Long id);

    Response assignAmenityToRoom(Long roomId, Long amenityId);

    Response removeAmenityFromRoom(Long roomId, Long amenityId);
}
