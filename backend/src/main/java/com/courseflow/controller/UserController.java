package com.courseflow.controller;

import com.courseflow.model.User;
import com.courseflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Long userId) {
        return userRepository.findById(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        return userRepository.findById(userId)
            .map(user -> {
                user.setFirstName(request.get("firstName"));
                user.setLastName(request.get("lastName"));
                user.setEmail(request.get("email"));
                user.setBio(request.get("bio"));
                user.setAvatar(request.get("avatar"));
                user.setInterests(request.get("interests"));
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{userId}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        return userRepository.findById(userId)
            .map(user -> {
                if (user.getPassword().equals(request.get("oldPassword"))) {
                    user.setPassword(request.get("newPassword"));
                    userRepository.save(user);
                    return ResponseEntity.ok().build();
                }
                return ResponseEntity.badRequest().body("Ancien mot de passe incorrect");
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok().build();
    }
}
