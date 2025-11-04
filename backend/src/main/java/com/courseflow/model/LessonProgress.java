package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_progress")
@Data
public class LessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "enrollment_id")
    private Enrollment enrollment;
    
    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = true)
    private Lesson lesson;
    
    private Boolean completed = false;
    private LocalDateTime completedAt;
}
