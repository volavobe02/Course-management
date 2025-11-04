package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lessons")
@Data
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "module_id")
    private CourseModule module;
    
    private String title;
    private String duration;
    private String videoUrl;
    private Integer orderIndex;
}
