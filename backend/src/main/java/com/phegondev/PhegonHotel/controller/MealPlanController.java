package com.phegondev.PhegonHotel.controller;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.MealPlan;
import com.phegondev.PhegonHotel.service.interfac.IMealPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/meal-plans")
public class MealPlanController {

    @Autowired
    private IMealPlanService mealPlanService;

    @GetMapping("/all")
    public ResponseEntity<Response> getAllMealPlans() {
        Response response = mealPlanService.getAllMealPlans();
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getMealPlanById(@PathVariable Long id) {
        Response response = mealPlanService.getMealPlanById(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createMealPlan(@RequestBody MealPlan mealPlan) {
        Response response = mealPlanService.createMealPlan(mealPlan);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> deleteMealPlan(@PathVariable Long id) {
        Response response = mealPlanService.deleteMealPlan(id);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}

