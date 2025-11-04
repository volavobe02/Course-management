package com.courseflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class CourseDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String instructor;
    private String thumbnail;
    private Double rating;
    private Integer reviewCount;
    private Integer students;
    private String duration;
    private String level;
    private String category;
    private List<ModuleDto> modules;
    private Integer progress;
    private Boolean isEnrolled;
    private Long enrollmentId;
    
    @Data
    @AllArgsConstructor
    public static class ModuleDto {
        private Long id;
        private String title;
        private List<LessonDto> lessons;
    }
    
    @Data
    @AllArgsConstructor
    public static class LessonDto {
        private Long id;
        private String title;
        private String duration;
        private String videoUrl;
        private Boolean completed;
        private Boolean locked;
    }
}
