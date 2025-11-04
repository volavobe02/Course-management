package com.courseflow.repository;

import com.courseflow.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByUserIdAndCourseId(Long userId, Long courseId);
}
