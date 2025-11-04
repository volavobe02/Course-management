package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quizzes")
@Data
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    
    private String title;
    private Integer questionCount;
    private String duration;
}
