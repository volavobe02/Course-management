package com.courseflow.controller;

import com.courseflow.model.Quiz;
import com.courseflow.model.Question;
import com.courseflow.repository.QuizRepository;
import com.courseflow.repository.QuestionRepository;
import com.courseflow.repository.QuizAttemptRepository;
import com.courseflow.repository.CourseRepository;
import com.courseflow.repository.CertificateRepository;
import com.courseflow.repository.UserRepository;
import com.courseflow.model.QuizAttempt;
import com.courseflow.model.Certificate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QuizController {
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final CourseRepository courseRepository;
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long quizId) {
        return quizRepository.findById(quizId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseQuizzes(@PathVariable Long courseId, @RequestParam Long userId) {
        List<Quiz> quizzes = quizRepository.findByCourseId(courseId);
        List<Map<String, Object>> result = quizzes.stream().map(quiz -> {
            var attempt = quizAttemptRepository.findByQuizIdAndUserId(quiz.getId(), userId);
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", quiz.getId());
            map.put("title", quiz.getTitle());
            map.put("questions", quiz.getQuestionCount());
            map.put("duration", quiz.getDuration());
            map.put("score", attempt.map(a -> a.getScore()).orElse(null));
            map.put("completed", attempt.isPresent());
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }
    
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Map<String, Object> request) {
        Quiz quiz = new Quiz();
        quiz.setCourse(courseRepository.findById(((Number) request.get("courseId")).longValue()).orElseThrow());
        quiz.setTitle((String) request.get("title"));
        quiz.setQuestionCount(((Number) request.get("questionCount")).intValue());
        quiz.setDuration((String) request.get("duration"));
        return ResponseEntity.ok(quizRepository.save(quiz));
    }
    
    @PostMapping("/questions")
    public ResponseEntity<Question> createQuestion(@RequestBody Map<String, Object> request) {
        Question question = new Question();
        question.setQuiz(quizRepository.findById(((Number) request.get("quizId")).longValue()).orElseThrow());
        question.setQuestion((String) request.get("question"));
        question.setOption1((String) request.get("option1"));
        question.setOption2((String) request.get("option2"));
        question.setOption3((String) request.get("option3"));
        question.setOption4((String) request.get("option4"));
        question.setCorrectAnswer(((Number) request.get("correctAnswer")).intValue());
        return ResponseEntity.ok(questionRepository.save(question));
    }
    
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuizQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionRepository.findByQuizId(quizId));
    }
    
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@PathVariable Long quizId, @RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        Integer score = ((Number) request.get("score")).intValue();
        
        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId)
            .orElse(new QuizAttempt());
        attempt.setQuiz(quizRepository.findById(quizId).orElseThrow());
        attempt.setUser(userRepository.findById(userId).orElseThrow());
        attempt.setScore(score);
        attempt.setCompletedAt(LocalDateTime.now());
        quizAttemptRepository.save(attempt);
        
        boolean certificateIssued = false;
        if (score >= 70) {
            Quiz quiz = quizRepository.findById(quizId).orElseThrow();
            var existingCert = certificateRepository.findByUserIdAndCourseId(userId, quiz.getCourse().getId());
            if (existingCert.isEmpty()) {
                Certificate certificate = new Certificate();
                certificate.setUser(userRepository.findById(userId).orElseThrow());
                certificate.setCourse(quiz.getCourse());
                certificate.setIssuedAt(LocalDateTime.now());
                certificate.setCertificateNumber("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                certificateRepository.save(certificate);
                certificateIssued = true;
            }
        }
        
        return ResponseEntity.ok(Map.of("success", true, "certificateIssued", certificateIssued));
    }
    
    @GetMapping("/certificate/{userId}/{courseId}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable Long userId, @PathVariable Long courseId) {
        return certificateRepository.findByUserIdAndCourseId(userId, courseId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
