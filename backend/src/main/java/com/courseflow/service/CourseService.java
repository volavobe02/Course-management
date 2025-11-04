package com.courseflow.service;

import com.courseflow.dto.CourseDetailResponse;
import com.courseflow.dto.CourseResponse;
import com.courseflow.dto.CreateCourseRequest;
import com.courseflow.model.Category;
import com.courseflow.model.Course;
import com.courseflow.model.CourseModule;
import com.courseflow.model.Enrollment;
import com.courseflow.model.Lesson;
import com.courseflow.model.LessonProgress;
import com.courseflow.model.User;
import com.courseflow.repository.CategoryRepository;
import com.courseflow.repository.CourseRepository;
import com.courseflow.repository.EnrollmentRepository;
import com.courseflow.repository.LessonRepository;
import com.courseflow.repository.ModuleRepository;
import com.courseflow.repository.ReviewRepository;
import com.courseflow.repository.UserRepository;
import com.courseflow.repository.ResourceRepository;
import com.courseflow.repository.LessonProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final ResourceRepository resourceRepository;
    private final LessonProgressRepository lessonProgressRepository;
    
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public List<CourseResponse> getCoursesByCategory(Long categoryId) {
        return courseRepository.findByCategoryId(categoryId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    public Course createCourse(CreateCourseRequest request, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
            .orElseThrow(() -> new RuntimeException("Instructor not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setInstructor(instructor);
        course.setCategory(category);
        course.setLevel(Course.Level.valueOf(request.getLevel().toUpperCase()));
        course.setThumbnail(request.getThumbnail());
        course.setRating(0.0);
        course.setStudentsCount(0);
        
        int totalDuration = 0;
        for (CreateCourseRequest.ModuleRequest moduleReq : request.getModules()) {
            String[] parts = moduleReq.getDuration().split(":");
            if (parts.length == 2) {
                totalDuration += Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
            } else if (parts.length == 1) {
                totalDuration += Integer.parseInt(parts[0]);
            }
        }
        course.setDuration(totalDuration / 60 + "h");
        
        course = courseRepository.save(course);
        
        for (int i = 0; i < request.getModules().size(); i++) {
            CreateCourseRequest.ModuleRequest moduleReq = request.getModules().get(i);
            CourseModule module = new CourseModule();
            module.setCourse(course);
            module.setTitle("Module " + (i + 1));
            module.setOrderIndex(i);
            module = moduleRepository.save(module);
            
            Lesson lesson = new Lesson();
            lesson.setModule(module);
            lesson.setTitle(moduleReq.getTitle());
            lesson.setDuration(moduleReq.getDuration());
            lesson.setVideoUrl(moduleReq.getVideoUrl());
            lesson.setOrderIndex(0);
            lessonRepository.save(lesson);
        }
        
        return course;
    }
    
    public List<Course> getTeacherCourses(Long teacherId) {
        return courseRepository.findAll().stream()
            .filter(c -> c.getInstructor().getId().equals(teacherId))
            .collect(Collectors.toList());
    }
    
    public CourseDetailResponse getCourseDetail(Long courseId, Long userId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        List<CourseModule> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        Enrollment enrollment = enrollmentRepository.findByUserId(userId).stream()
            .filter(e -> e.getCourse().getId().equals(courseId))
            .findFirst()
            .orElse(null);
        
        List<LessonProgress> progressList = enrollment != null 
            ? lessonProgressRepository.findByEnrollmentId(enrollment.getId())
            : List.of();
        
        List<CourseDetailResponse.ModuleDto> moduleDtos = modules.stream()
            .map(module -> {
                List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId());
                List<CourseDetailResponse.LessonDto> lessonDtos = lessons.stream()
                    .map(lesson -> {
                        boolean completed = progressList.stream()
                            .filter(p -> p.getLesson() != null)
                            .anyMatch(p -> p.getLesson().getId().equals(lesson.getId()) && p.getCompleted());
                        return new CourseDetailResponse.LessonDto(
                            lesson.getId(),
                            lesson.getTitle(),
                            lesson.getDuration(),
                            lesson.getVideoUrl(),
                            completed,
                            false
                        );
                    })
                    .collect(Collectors.toList());
                return new CourseDetailResponse.ModuleDto(module.getId(), module.getTitle(), lessonDtos);
            })
            .collect(Collectors.toList());
        
        Double avgRating = reviewRepository.getAverageRatingByCourseId(courseId);
        Long reviewCount = (long) reviewRepository.findByCourseId(courseId).size();
        Long studentsCount = enrollmentRepository.countByCourseId(courseId);
        
        return new CourseDetailResponse(
            course.getId(),
            course.getTitle(),
            course.getDescription(),
            course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName(),
            course.getThumbnail(),
            avgRating != null ? avgRating : 0.0,
            reviewCount.intValue(),
            studentsCount.intValue(),
            course.getDuration(),
            course.getLevel().name(),
            course.getCategory().getName(),
            moduleDtos,
            enrollment != null ? enrollment.getProgress() : 0,
            enrollment != null,
            enrollment != null ? enrollment.getId() : null
        );
    }
    
    @Transactional
    public Course updateCourse(Long courseId, CreateCourseRequest request, Long instructorId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        if (!course.getInstructor().getId().equals(instructorId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(category);
        course.setLevel(Course.Level.valueOf(request.getLevel().toUpperCase()));
        course.setThumbnail(request.getThumbnail());
        
        int totalDuration = 0;
        for (CreateCourseRequest.ModuleRequest moduleReq : request.getModules()) {
            String[] parts = moduleReq.getDuration().split(":");
            if (parts.length == 2) {
                totalDuration += Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
            } else if (parts.length == 1) {
                totalDuration += Integer.parseInt(parts[0]);
            }
        }
        course.setDuration(totalDuration / 60 + "h");
        
        List<CourseModule> existingModules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        List<Lesson> oldLessons = existingModules.stream()
            .flatMap(m -> lessonRepository.findByModuleIdOrderByOrderIndexAsc(m.getId()).stream())
            .collect(Collectors.toList());
        
        for (CourseModule module : existingModules) {
            lessonRepository.deleteAll(lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId()));
        }
        moduleRepository.deleteAll(existingModules);
        
        for (int i = 0; i < request.getModules().size(); i++) {
            CreateCourseRequest.ModuleRequest moduleReq = request.getModules().get(i);
            CourseModule module = new CourseModule();
            module.setCourse(course);
            module.setTitle("Module " + (i + 1));
            module.setOrderIndex(i);
            module = moduleRepository.save(module);
            
            Lesson newLesson = new Lesson();
            newLesson.setModule(module);
            newLesson.setTitle(moduleReq.getTitle());
            newLesson.setDuration(moduleReq.getDuration());
            newLesson.setVideoUrl(moduleReq.getVideoUrl());
            newLesson.setOrderIndex(0);
            newLesson = lessonRepository.save(newLesson);
            
            Lesson oldLesson = oldLessons.stream()
                .filter(l -> l.getTitle().equals(moduleReq.getTitle()))
                .findFirst()
                .orElse(null);
            
            if (oldLesson != null) {
                List<LessonProgress> oldProgress = lessonProgressRepository.findAll().stream()
                    .filter(lp -> lp.getLesson() != null && lp.getLesson().getId().equals(oldLesson.getId()))
                    .collect(Collectors.toList());
                
                for (LessonProgress lp : oldProgress) {
                    lp.setLesson(newLesson);
                    lessonProgressRepository.save(lp);
                }
            }
        }
        
        List<Enrollment> enrollments = enrollmentRepository.findAll().stream()
            .filter(e -> e.getCourse().getId().equals(courseId))
            .collect(Collectors.toList());
        
        int totalLessons = request.getModules().size();
        for (Enrollment enrollment : enrollments) {
            List<LessonProgress> progressList = lessonProgressRepository.findByEnrollmentId(enrollment.getId());
            long completedCount = progressList.stream()
                .filter(lp -> lp.getLesson() != null && lp.getCompleted())
                .count();
            int newProgress = totalLessons > 0 ? (int) ((completedCount * 100) / totalLessons) : 0;
            enrollment.setProgress(newProgress);
            enrollmentRepository.save(enrollment);
        }
        
        return courseRepository.save(course);
    }
    
    public java.util.Map<String, Object> getCourseContent(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        List<com.courseflow.model.Resource> resources = resourceRepository.findAll().stream()
            .filter(r -> r.getCourse().getId().equals(courseId))
            .collect(Collectors.toList());
        
        java.util.Map<String, Object> content = new java.util.HashMap<>();
        content.put("title", course.getTitle());
        content.put("objectives", course.getObjectives() != null ? 
            java.util.Arrays.asList(course.getObjectives().split("\\|\\|\\|")) : List.of());
        content.put("resources", resources);
        return content;
    }
    
    public void updateObjectives(Long courseId, List<String> objectives) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setObjectives(String.join("|||", objectives));
        courseRepository.save(course);
    }
    
    public com.courseflow.model.Resource addResource(Long courseId, java.util.Map<String, String> request) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        com.courseflow.model.Resource resource = new com.courseflow.model.Resource();
        resource.setCourse(course);
        resource.setName(request.get("name"));
        resource.setFileUrl(request.get("fileUrl"));
        resource.setFileSize(request.get("fileSize"));
        return resourceRepository.save(resource);
    }
    
    public void deleteResource(Long resourceId) {
        resourceRepository.deleteById(resourceId);
    }
    
    @org.springframework.transaction.annotation.Transactional
    public void deleteCourse(Long courseId) {
        List<CourseModule> modules = moduleRepository.findByCourseIdOrderByOrderIndexAsc(courseId);
        for (CourseModule module : modules) {
            List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId());
            for (Lesson lesson : lessons) {
                lessonProgressRepository.findAll().stream()
                    .filter(lp -> lp.getLesson() != null && lp.getLesson().getId().equals(lesson.getId()))
                    .forEach(lp -> lessonProgressRepository.delete(lp));
            }
            lessonRepository.deleteAll(lessons);
        }
        moduleRepository.deleteAll(modules);
        
        enrollmentRepository.findAll().stream()
            .filter(e -> e.getCourse().getId().equals(courseId))
            .forEach(e -> enrollmentRepository.delete(e));
        
        reviewRepository.findByCourseId(courseId).forEach(r -> reviewRepository.delete(r));
        
        resourceRepository.findAll().stream()
            .filter(r -> r.getCourse().getId().equals(courseId))
            .forEach(r -> resourceRepository.delete(r));
        
        courseRepository.deleteById(courseId);
    }
    
    private CourseResponse mapToResponse(Course course) {
        Double avgRating = reviewRepository.getAverageRatingByCourseId(course.getId());
        Long studentsCount = enrollmentRepository.countByCourseId(course.getId());
        
        return new CourseResponse(
            course.getId(),
            course.getTitle(),
            course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName(),
            course.getThumbnail(),
            avgRating != null ? avgRating : 0.0,
            studentsCount.intValue(),
            course.getDuration(),
            course.getLevel().name(),
            course.getCategory().getName()
        );
    }
}
