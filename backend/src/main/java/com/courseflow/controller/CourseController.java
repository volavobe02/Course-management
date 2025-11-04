package com.courseflow.controller;

import com.courseflow.dto.CourseDetailResponse;
import com.courseflow.dto.CourseResponse;
import com.courseflow.dto.CreateCourseRequest;
import com.courseflow.model.Category;
import com.courseflow.model.Course;
import com.courseflow.repository.CategoryRepository;
import com.courseflow.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;
    private final CategoryRepository categoryRepository;
    
    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }
    
    @GetMapping("/courses/category/{categoryId}")
    public ResponseEntity<List<CourseResponse>> getCoursesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(categoryId));
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
    
    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody CreateCourseRequest request, @RequestParam Long instructorId) {
        return ResponseEntity.ok(courseService.createCourse(request, instructorId));
    }
    
    @GetMapping("/courses/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getTeacherCourses(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getTeacherCourses(teacherId));
    }
    
    @GetMapping("/courses/{courseId}/detail")
    public ResponseEntity<CourseDetailResponse> getCourseDetail(@PathVariable Long courseId, @RequestParam Long userId) {
        return ResponseEntity.ok(courseService.getCourseDetail(courseId, userId));
    }
    
    @PutMapping("/courses/{courseId}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long courseId, @RequestBody CreateCourseRequest request, @RequestParam Long instructorId) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request, instructorId));
    }
    
    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/courses/{courseId}/content")
    public ResponseEntity<?> getCourseContent(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourseContent(courseId));
    }
    
    @PutMapping("/courses/{courseId}/objectives")
    public ResponseEntity<?> updateObjectives(@PathVariable Long courseId, @RequestBody java.util.Map<String, java.util.List<String>> request) {
        courseService.updateObjectives(courseId, request.get("objectives"));
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/courses/{courseId}/resources")
    public ResponseEntity<?> addResource(@PathVariable Long courseId, @RequestBody java.util.Map<String, String> request) {
        return ResponseEntity.ok(courseService.addResource(courseId, request));
    }
    
    @DeleteMapping("/courses/{courseId}/resources/{resourceId}")
    public ResponseEntity<?> deleteResource(@PathVariable Long resourceId) {
        courseService.deleteResource(resourceId);
        return ResponseEntity.ok().build();
    }
}
