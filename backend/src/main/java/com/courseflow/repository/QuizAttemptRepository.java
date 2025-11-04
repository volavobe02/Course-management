package com.courseflow.repository;

import com.courseflow.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(Long quizId);
    Optional<QuizAttempt> findByQuizIdAndUserId(Long quizId, Long userId);
}
