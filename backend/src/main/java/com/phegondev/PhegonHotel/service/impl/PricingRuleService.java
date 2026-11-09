package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.PricingRuleDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.PricingRule;
import com.phegondev.PhegonHotel.entity.Room;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.PricingRuleRepository;
import com.phegondev.PhegonHotel.repo.RoomRepository;
import com.phegondev.PhegonHotel.service.interfac.IPricingRuleService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PricingRuleService implements IPricingRuleService {

    @Autowired
    private PricingRuleRepository pricingRuleRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public Response getRulesForRoom(Long roomId) {
        Response response = new Response();
        try {
            List<PricingRule> rules = pricingRuleRepository.findByRoomId(roomId);
            List<PricingRuleDTO> dtoList = rules.stream()
                    .map(Utils::mapPricingRuleEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setPricingRuleList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching pricing rules: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response createRule(Long roomId, PricingRule rule) {
        Response response = new Response();
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));
            rule.setRoom(room);
            PricingRule saved = pricingRuleRepository.save(rule);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setPricingRule(Utils.mapPricingRuleEntityToDTO(saved));
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating pricing rule: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response deleteRule(Long ruleId) {
        Response response = new Response();
        try {
            pricingRuleRepository.findById(ruleId)
                    .orElseThrow(() -> new OurException("Pricing Rule Not Found"));
            pricingRuleRepository.deleteById(ruleId);
            response.setStatusCode(200);
            response.setMessage("successful");
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error deleting pricing rule: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getEffectivePrice(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        Response response = new Response();
        try {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new OurException("Room Not Found"));
            List<PricingRule> rules = pricingRuleRepository.findByRoomId(roomId);
            BigDecimal basePrice = room.getRoomPrice();

            long nights = checkIn.datesUntil(checkOut).count();
            if (nights <= 0) {
                response.setStatusCode(400);
                response.setMessage("Check-out must be after check-in");
                return response;
            }

            BigDecimal totalPrice = BigDecimal.ZERO;
            for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
                BigDecimal dayPrice = basePrice;
                int dow = date.getDayOfWeek().getValue(); // 1=Mon..7=Sun

                for (PricingRule rule : rules) {
                    boolean inDateRange = rule.getStartDate() != null && rule.getEndDate() != null
                            && !date.isBefore(rule.getStartDate()) && !date.isAfter(rule.getEndDate());
                    boolean matchesDow = rule.getDayOfWeek() != null && rule.getDayOfWeek() == dow;

                    if (inDateRange || matchesDow) {
                        if (rule.getPriceOverride() != null) {
                            dayPrice = rule.getPriceOverride();
                            break; // override takes full precedence
                        } else if (rule.getPriceMultiplier() != null) {
                            dayPrice = basePrice.multiply(rule.getPriceMultiplier());
                        }
                    }
                }
                totalPrice = totalPrice.add(dayPrice);
            }

            BigDecimal effectivePrice = totalPrice.setScale(2, RoundingMode.HALF_UP);
            response.setStatusCode(200);
            response.setMessage("Effective total price for " + nights + " night(s)");
            response.setEffectivePrice(effectivePrice);
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error calculating effective price: " + e.getMessage());
        }
        return response;
    }
}
