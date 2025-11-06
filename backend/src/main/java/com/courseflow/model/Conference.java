package com.courseflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "conferences")
public class Conference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;
    
    private String meetingId;
    private LocalDateTime scheduledAt;
    private Integer duration; // in minutes
    private String status; // SCHEDULED, LIVE, ENDED
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
