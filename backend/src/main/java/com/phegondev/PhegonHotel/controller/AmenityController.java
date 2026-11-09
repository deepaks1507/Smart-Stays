package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Amenity;
import com.phegondev.PhegonHotel.service.interfac.IAmenityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/amenities")
public class AmenityController {

    @Autowired
    private IAmenityService amenityService;

    @GetMapping("/all")
    public ResponseEntity<Response> getAllAmenities() {
        Response response = amenityService.getAllAmenities();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/by-category")
    public ResponseEntity<Response> getAmenitiesByCategory(@RequestParam String category) {
        Response response = amenityService.getAmenitiesByCategory(category);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createAmenity(@RequestBody Amenity amenity) {
        Response response = amenityService.createAmenity(amenity);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteAmenity(@PathVariable Long id) {
        Response response = amenityService.deleteAmenity(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> assignAmenityToRoom(@RequestParam Long roomId, @RequestParam Long amenityId) {
        Response response = amenityService.assignAmenityToRoom(roomId, amenityId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/remove")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> removeAmenityFromRoom(@RequestParam Long roomId, @RequestParam Long amenityId) {
        Response response = amenityService.removeAmenityFromRoom(roomId, amenityId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
