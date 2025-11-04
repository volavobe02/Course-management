package com.courseflow.service;

import com.courseflow.dto.AuthResponse;
import com.courseflow.dto.LoginRequest;
import com.courseflow.dto.RegisterRequest;
import com.courseflow.model.User;
import com.courseflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name()
        );
    }
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "STUDENT";
        if (roleStr.equals("TEACHER")) {
            user.setRole(User.Role.TEACHER);
        } else {
            user.setRole(User.Role.STUDENT);
        }
        
        user = userRepository.save(user);
        
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name()
        );
    }
}
