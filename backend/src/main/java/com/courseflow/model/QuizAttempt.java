package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
@Data
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private Integer score;
    private LocalDateTime completedAt;
}
