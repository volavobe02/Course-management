package com.courseflow.repository;

import com.courseflow.model.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseIdOrderByOrderIndexAsc(Long courseId);
}
