package com.courseflow.service;

import com.courseflow.model.Enrollment;
import com.courseflow.model.Lesson;
import com.courseflow.model.LessonProgress;
import com.courseflow.repository.EnrollmentRepository;
import com.courseflow.repository.LessonProgressRepository;
import com.courseflow.repository.LessonRepository;
import com.courseflow.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    public final EnrollmentRepository enrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final com.courseflow.repository.UserRepository userRepository;
    private final com.courseflow.repository.CourseRepository courseRepository;
    
    public List<com.courseflow.dto.EnrolledStudentDto> getCourseStudents(Long courseId) {
        return enrollmentRepository.findAll().stream()
            .filter(e -> e.getCourse().getId().equals(courseId))
            .map(e -> new com.courseflow.dto.EnrolledStudentDto(
                e.getUser().getId(),
                e.getUser().getFirstName(),
                e.getUser().getLastName(),
                e.getUser().getEmail(),
                e.getProgress(),
                e.getEnrolledAt().toString()
            ))
            .toList();
    }
    
    public Enrollment enrollUser(Long userId, Long courseId) {
        com.courseflow.model.User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        com.courseflow.model.Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setProgress(0);
        enrollment.setEnrolledAt(LocalDateTime.now());
        
        return enrollmentRepository.save(enrollment);
    }
    
    public void markLessonComplete(Long enrollmentId, Long lessonId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        LessonProgress progress = lessonProgressRepository
            .findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
            .orElse(new LessonProgress());
        
        if (!progress.getCompleted()) {
            Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
            
            progress.setEnrollment(enrollment);
            progress.setLesson(lesson);
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
            
            updateCourseProgress(enrollmentId);
        }
    }
    
    private void updateCourseProgress(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        List<Lesson> allLessons = lessonRepository.findAll().stream()
            .filter(l -> l.getModule().getCourse().getId().equals(enrollment.getCourse().getId()))
            .toList();
        
        List<LessonProgress> completedLessons = lessonProgressRepository.findByEnrollmentId(enrollmentId)
            .stream()
            .filter(lp -> lp.getLesson() != null)
            .filter(LessonProgress::getCompleted)
            .toList();
        
        int progress = allLessons.isEmpty() ? 0 : (completedLessons.size() * 100) / allLessons.size();
        enrollment.setProgress(progress);
        
        if (progress == 100) {
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        
        enrollmentRepository.save(enrollment);
    }
}
