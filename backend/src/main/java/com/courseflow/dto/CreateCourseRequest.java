package com.courseflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateCourseRequest {
    private String title;
    private String description;
    private Long categoryId;
    private String level;
    private String thumbnail;
    private List<ModuleRequest> modules;
    
    @Data
    public static class ModuleRequest {
        private String title;
        private String duration;
        private String videoUrl;
    }
}
