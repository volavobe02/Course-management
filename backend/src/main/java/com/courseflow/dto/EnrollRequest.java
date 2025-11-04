package com.courseflow.dto;

import lombok.Data;

@Data
public class EnrollRequest {
    private Long userId;
    private Long courseId;
}
