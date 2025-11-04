package com.courseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String title;
    private String instructor;
    private String thumbnail;
    private Double rating;
    private Integer students;
    private String duration;
    private String level;
    private String category;
}
