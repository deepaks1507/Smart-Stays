package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.PricingRule;

import java.time.LocalDate;

public interface IPricingRuleService {

    Response getRulesForRoom(Long roomId);

    Response createRule(Long roomId, PricingRule rule);

    Response deleteRule(Long ruleId);

    Response getEffectivePrice(Long roomId, LocalDate checkIn, LocalDate checkOut);
}
