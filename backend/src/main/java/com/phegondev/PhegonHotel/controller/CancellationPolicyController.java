package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.CancellationPolicy;
import com.phegondev.PhegonHotel.service.interfac.ICancellationPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cancellation-policies")
public class CancellationPolicyController {

    @Autowired
    private ICancellationPolicyService cancellationPolicyService;

    @GetMapping("/all")
    public ResponseEntity<Response> getAllPolicies() {
        Response response = cancellationPolicyService.getAllPolicies();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getPolicyById(@PathVariable Long id) {
        Response response = cancellationPolicyService.getPolicyById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createPolicy(@RequestBody CancellationPolicy policy) {
        Response response = cancellationPolicyService.createPolicy(policy);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updatePolicy(@PathVariable Long id, @RequestBody CancellationPolicy policy) {
        Response response = cancellationPolicyService.updatePolicy(id, policy);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
