package com.courseflow.controller;

import com.courseflow.dto.CreateReviewRequest;
import com.courseflow.dto.ReviewDto;
import com.courseflow.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<Void> createReview(@RequestBody CreateReviewRequest request) {
        reviewService.createReview(request);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ReviewDto>> getCourseReviews(@PathVariable Long courseId) {
        return ResponseEntity.ok(reviewService.getCourseReviews(courseId));
    }
}
