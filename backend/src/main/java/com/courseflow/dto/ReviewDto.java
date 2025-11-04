package com.courseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    private String userName;
    private Integer rating;
    private String comment;
    private String createdAt;
}
