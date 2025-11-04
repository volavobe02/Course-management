package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(length = 2000)
    private String objectives;
    
    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private User instructor;
    
    private String thumbnail;
    private Double rating;
    private Integer studentsCount;
    private String duration;
    
    @Enumerated(EnumType.STRING)
    private Level level;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    public enum Level {
        DEBUTANT, INTERMEDIAIRE, AVANCE
    }
}
