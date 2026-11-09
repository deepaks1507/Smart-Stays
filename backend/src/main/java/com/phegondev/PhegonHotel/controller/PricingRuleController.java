package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.PricingRule;
import com.phegondev.PhegonHotel.service.interfac.IPricingRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/pricing-rules")
public class PricingRuleController {

    @Autowired
    private IPricingRuleService pricingRuleService;

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Response> getRulesForRoom(@PathVariable Long roomId) {
        Response response = pricingRuleService.getRulesForRoom(roomId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/create/{roomId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createRule(@PathVariable Long roomId, @RequestBody PricingRule rule) {
        Response response = pricingRuleService.createRule(roomId, rule);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{ruleId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteRule(@PathVariable Long ruleId) {
        Response response = pricingRuleService.deleteRule(ruleId);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/effective-price/{roomId}")
    public ResponseEntity<Response> getEffectivePrice(
            @PathVariable Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        Response response = pricingRuleService.getEffectivePrice(roomId, checkIn, checkOut);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
