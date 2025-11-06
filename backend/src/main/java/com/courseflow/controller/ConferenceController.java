package com.courseflow.controller;

import com.courseflow.model.Conference;
import com.courseflow.model.User;
import com.courseflow.repository.ConferenceRepository;
import com.courseflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conferences")
@CrossOrigin(origins = "*")
public class ConferenceController {
    
    @Autowired
    private ConferenceRepository conferenceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping
    public ResponseEntity<Conference> createConference(@RequestBody Conference conference, @RequestParam Long teacherId) {
        User teacher = userRepository.findById(teacherId).orElseThrow();
        conference.setTeacher(teacher);
        conference.setMeetingId(UUID.randomUUID().toString());
        conference.setStatus("SCHEDULED");
        conference.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(conferenceRepository.save(conference));
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Conference>> getTeacherConferences(@PathVariable Long teacherId) {
        return ResponseEntity.ok(conferenceRepository.findByTeacherId(teacherId));
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<Conference>> getAvailableConferences() {
        return ResponseEntity.ok(conferenceRepository.findByStatusOrderByScheduledAtDesc("SCHEDULED"));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Conference> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Conference conference = conferenceRepository.findById(id).orElseThrow();
        conference.setStatus(status);
        return ResponseEntity.ok(conferenceRepository.save(conference));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Conference> getConference(@PathVariable Long id) {
        return ResponseEntity.ok(conferenceRepository.findById(id).orElseThrow());
    }
}
