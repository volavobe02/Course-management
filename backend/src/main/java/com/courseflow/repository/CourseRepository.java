package com.courseflow.repository;

import com.courseflow.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCategoryId(Long categoryId);
}
