package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "modules")
@Data
public class CourseModule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    
    private String title;
    private Integer orderIndex;
}
