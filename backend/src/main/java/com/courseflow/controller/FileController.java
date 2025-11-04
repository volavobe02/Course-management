package com.courseflow.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {
    
    private static final String UPLOAD_DIR = "uploads/";
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.write(filePath, file.getBytes());
            
            Map<String, String> response = new HashMap<>();
            response.put("url", "/uploads/" + fileName);
            response.put("fileName", fileName);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'upload: " + e.getMessage());
        }
    }
    
    @GetMapping("/download/**")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        try {
            Path filePath = Paths.get(path.replace("/uploads/", UPLOAD_DIR));
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String originalFileName = filePath.getFileName().toString();
                if (originalFileName.contains("_")) {
                    originalFileName = originalFileName.substring(originalFileName.indexOf("_") + 1);
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + originalFileName + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
