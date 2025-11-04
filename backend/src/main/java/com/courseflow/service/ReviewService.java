package com.courseflow.service;

import com.courseflow.dto.CreateReviewRequest;
import com.courseflow.dto.ReviewDto;
import com.courseflow.model.Review;
import com.courseflow.repository.CourseRepository;
import com.courseflow.repository.ReviewRepository;
import com.courseflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    
    public Review createReview(CreateReviewRequest request) {
        Review review = reviewRepository.findByCourseId(request.getCourseId()).stream()
            .filter(r -> r.getUser().getId().equals(request.getUserId()))
            .findFirst()
            .orElse(new Review());
        
        if (review.getId() == null) {
            review.setUser(userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found")));
            review.setCourse(courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found")));
            review.setCreatedAt(LocalDateTime.now());
        }
        
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        return reviewRepository.save(review);
    }
    
    public List<ReviewDto> getCourseReviews(Long courseId) {
        return reviewRepository.findByCourseId(courseId).stream()
            .map(r -> new ReviewDto(
                r.getId(),
                r.getUser().getFirstName() + " " + r.getUser().getLastName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt().toString()
            ))
            .toList();
    }
}
