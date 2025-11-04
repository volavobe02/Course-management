package com.courseflow.repository;

import com.courseflow.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourseId(Long courseId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.course.id = :courseId")
    Double getAverageRatingByCourseId(Long courseId);
}
