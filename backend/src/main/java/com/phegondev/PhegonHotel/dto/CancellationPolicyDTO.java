package com.phegondev.PhegonHotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CancellationPolicyDTO {
    private Long id;
    private String name;
    private boolean isFreeCancel;
    private Integer freeCancellationHoursBefore;
    private Integer partialRefundPercentage;
    private Integer partialRefundHoursThreshold;
    private String policyDescription;
}
