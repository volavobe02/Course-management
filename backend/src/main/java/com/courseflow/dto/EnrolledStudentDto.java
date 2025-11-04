package com.courseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EnrolledStudentDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer progress;
    private String enrolledAt;
}
