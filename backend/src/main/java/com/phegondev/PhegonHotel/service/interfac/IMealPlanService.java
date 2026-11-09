package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.MealPlan;

public interface IMealPlanService {

    Response getAllMealPlans();

    Response getMealPlanById(Long id);

    Response createMealPlan(MealPlan mealPlan);

    Response deleteMealPlan(Long id);
}
