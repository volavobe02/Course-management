package com.courseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
}
