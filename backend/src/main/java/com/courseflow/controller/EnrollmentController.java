package com.courseflow.controller;

import com.courseflow.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    
    @PostMapping("/{enrollmentId}/lessons/{lessonId}/complete")
    public ResponseEntity<Void> markLessonComplete(@PathVariable Long enrollmentId, @PathVariable Long lessonId) {
        enrollmentService.markLessonComplete(enrollmentId, lessonId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping
    public ResponseEntity<Void> enrollUser(@RequestParam Long userId, @RequestParam Long courseId) {
        enrollmentService.enrollUser(userId, courseId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/course/{courseId}/students")
    public ResponseEntity<java.util.List<com.courseflow.dto.EnrolledStudentDto>> getCourseStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getCourseStudents(courseId));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<com.courseflow.model.Enrollment>> getUserEnrollments(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentService.enrollmentRepository.findByUserId(userId));
    }
}
