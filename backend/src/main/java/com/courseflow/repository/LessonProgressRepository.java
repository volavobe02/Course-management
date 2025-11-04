package com.courseflow.repository;

import com.courseflow.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByEnrollmentId(Long enrollmentId);
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);
    
    @Modifying
    @Transactional
    void deleteByLessonId(Long lessonId);
}
