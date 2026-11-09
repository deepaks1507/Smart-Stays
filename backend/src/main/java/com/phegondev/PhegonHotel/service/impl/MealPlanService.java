package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.MealPlanDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.MealPlan;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.MealPlanRepository;
import com.phegondev.PhegonHotel.service.interfac.IMealPlanService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MealPlanService implements IMealPlanService {

    @Autowired
    private MealPlanRepository mealPlanRepository;

    @Override
    public Response getAllMealPlans() {
        Response response = new Response();
        try {
            List<MealPlan> mealPlans = mealPlanRepository.findAll();
            List<MealPlanDTO> dtoList = mealPlans.stream()
                    .map(Utils::mapMealPlanEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setMealPlanList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching meal plans: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getMealPlanById(Long id) {
        Response response = new Response();
        try {
            MealPlan mealPlan = mealPlanRepository.findById(id)
                    .orElseThrow(() -> new OurException("Meal Plan Not Found"));
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setMealPlan(Utils.mapMealPlanEntityToDTO(mealPlan));
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching meal plan: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response createMealPlan(MealPlan mealPlan) {
        Response response = new Response();
        try {
            MealPlan saved = mealPlanRepository.save(mealPlan);
            response.setStatusCode(200);
            response.setMessage("Meal plan created successfully");
            response.setMealPlan(Utils.mapMealPlanEntityToDTO(saved));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating meal plan: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteMealPlan(Long id) {
        Response response = new Response();
        try {
            mealPlanRepository.findById(id).orElseThrow(() -> new OurException("Meal Plan Not Found"));
            mealPlanRepository.deleteById(id);
            response.setStatusCode(200);
            response.setMessage("Meal plan deleted successfully");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting meal plan: " + e.getMessage());
        }
        return response;
    }
}
