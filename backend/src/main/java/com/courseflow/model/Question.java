package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "questions")
@Data
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;
    
    @Column(length = 500)
    private String question;
    
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private Integer correctAnswer;
}
