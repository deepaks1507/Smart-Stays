package com.phegondev.PhegonHotel.service.interfac;

import com.phegondev.PhegonHotel.dto.Response;
import com.phegondev.PhegonHotel.entity.CancellationPolicy;

public interface ICancellationPolicyService {

    Response getAllPolicies();

    Response getPolicyById(Long id);

    Response createPolicy(CancellationPolicy policy);

    Response updatePolicy(Long id, CancellationPolicy policy);
}
