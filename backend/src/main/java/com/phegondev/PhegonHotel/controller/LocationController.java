package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.LocationDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.Location;
import com.phegondev.PhegonHotel.repo.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/locations")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    /** Public — returns only active locations (used by user-facing dropdowns) */
    @GetMapping("/all")
    public ResponseEntity<Response> getAllActive() {
        Response response = new Response();
        try {
            List<LocationDTO> dtos = locationRepository.findByIsActiveTrue()
                    .stream().map(this::toDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setLocationList(dtos);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching locations: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /** Admin — returns all locations including inactive */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAll() {
        Response response = new Response();
        try {
            List<LocationDTO> dtos = locationRepository.findAll()
                    .stream().map(this::toDTO).collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setLocationList(dtos);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching locations: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /** Admin — add a new location */
    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> add(@RequestBody LocationDTO request) {
        Response response = new Response();
        try {
            Location location = new Location();
            location.setName(request.getName().trim());
            location.setActive(true);
            locationRepository.save(location);
            response.setStatusCode(200);
            response.setMessage("Location added successfully");
            response.setLocation(toDTO(location));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error adding location: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /** Admin — toggle active/inactive */
    @PutMapping("/toggle/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> toggle(@PathVariable Long id) {
        Response response = new Response();
        try {
            Location location = locationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            location.setActive(!location.isActive());
            locationRepository.save(location);
            response.setStatusCode(200);
            response.setMessage("Location " + (location.isActive() ? "activated" : "deactivated"));
            response.setLocation(toDTO(location));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error toggling location: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    /** Admin — delete a location */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> delete(@PathVariable Long id) {
        Response response = new Response();
        try {
            locationRepository.deleteById(id);
            response.setStatusCode(200);
            response.setMessage("Location deleted successfully");
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting location: " + e.getMessage());
        }
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    private LocationDTO toDTO(Location l) {
        LocationDTO dto = new LocationDTO();
        dto.setId(l.getId());
        dto.setName(l.getName());
        dto.setIsActive(l.isActive());
        return dto;
    }
}
