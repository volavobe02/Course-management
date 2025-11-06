package com.courseflow.repository;

import com.courseflow.model.Conference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConferenceRepository extends JpaRepository<Conference, Long> {
    List<Conference> findByTeacherId(Long teacherId);
    List<Conference> findByStatusOrderByScheduledAtDesc(String status);
}
