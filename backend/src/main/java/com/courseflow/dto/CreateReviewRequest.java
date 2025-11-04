package com.courseflow.dto;

import lombok.Data;

@Data
public class CreateReviewRequest {
    private Long userId;
    private Long courseId;
    private Integer rating;
    private String comment;
}
