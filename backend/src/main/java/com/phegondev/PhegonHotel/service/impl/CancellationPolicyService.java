package com.phegondev.PhegonHotel.service.impl;

import com.phegondev.PhegonHotel.dto.CancellationPolicyDTO;
import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.CancellationPolicy;
import com.phegondev.PhegonHotel.exception.OurException;
import com.phegondev.PhegonHotel.repo.CancellationPolicyRepository;
import com.phegondev.PhegonHotel.service.interfac.ICancellationPolicyService;
import com.phegondev.PhegonHotel.utils.Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CancellationPolicyService implements ICancellationPolicyService {

    @Autowired
    private CancellationPolicyRepository cancellationPolicyRepository;

    @Override
    public Response getAllPolicies() {
        Response response = new Response();
        try {
            List<CancellationPolicy> policies = cancellationPolicyRepository.findAll();
            List<CancellationPolicyDTO> dtoList = policies.stream()
                    .map(Utils::mapCancellationPolicyEntityToDTO)
                    .collect(Collectors.toList());
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setCancellationPolicyList(dtoList);
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching cancellation policies: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response getPolicyById(Long id) {
        Response response = new Response();
        try {
            CancellationPolicy policy = cancellationPolicyRepository.findById(id)
                    .orElseThrow(() -> new OurException("Cancellation Policy Not Found"));
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setCancellationPolicy(Utils.mapCancellationPolicyEntityToDTO(policy));
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error fetching cancellation policy: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response createPolicy(CancellationPolicy policy) {
        Response response = new Response();
        try {
            CancellationPolicy saved = cancellationPolicyRepository.save(policy);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setCancellationPolicy(Utils.mapCancellationPolicyEntityToDTO(saved));
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error creating cancellation policy: " + e.getMessage());
        }
        return response;
    }

    @Override
    public Response updatePolicy(Long id, CancellationPolicy policy) {
        Response response = new Response();
        try {
            CancellationPolicy existing = cancellationPolicyRepository.findById(id)
                    .orElseThrow(() -> new OurException("Cancellation Policy Not Found"));
            if (policy.getName() != null) existing.setName(policy.getName());
            existing.setFreeCancel(policy.isFreeCancel());
            if (policy.getFreeCancellationHoursBefore() != null)
                existing.setFreeCancellationHoursBefore(policy.getFreeCancellationHoursBefore());
            if (policy.getPartialRefundPercentage() != null)
                existing.setPartialRefundPercentage(policy.getPartialRefundPercentage());
            if (policy.getPartialRefundHoursThreshold() != null)
                existing.setPartialRefundHoursThreshold(policy.getPartialRefundHoursThreshold());
            if (policy.getPolicyDescription() != null)
                existing.setPolicyDescription(policy.getPolicyDescription());
            CancellationPolicy updated = cancellationPolicyRepository.save(existing);
            response.setStatusCode(200);
            response.setMessage("successful");
            response.setCancellationPolicy(Utils.mapCancellationPolicyEntityToDTO(updated));
        } catch (OurException e) {
            response.setStatusCode(404);
            response.setMessage(e.getMessage());
        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error updating cancellation policy: " + e.getMessage());
        }
        return response;
    }
}
