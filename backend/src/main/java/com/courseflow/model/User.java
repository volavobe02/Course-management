package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    
    @Column(length = 500)
    private String bio;
    private String avatar;
    private String interests;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    public enum Role {
        STUDENT, TEACHER
    }
}
