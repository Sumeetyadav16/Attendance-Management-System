package com.attendance.service;

import com.attendance.dto.*;
import com.attendance.model.*;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.UserRepository;
import com.attendance.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;  // ✅ add this
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public String register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered: " + req.getEmail());

        if ("STUDENT".equals(req.getRole()) && req.getRollNumber() != null
                && userRepository.existsByRollNumber(req.getRollNumber()))
            throw new RuntimeException("Roll number already exists.");

        Role role = Role.valueOf(req.getRole().toUpperCase());

        User user = User.builder()
            .name(req.getName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(role)
            .rollNumber(req.getRollNumber())
            .course(req.getCourse())
            .section(req.getSection())
            .build();

        userRepository.save(user);

        // ✅ If student, also save to Student table so faculty can see them
        if ("STUDENT".equalsIgnoreCase(req.getRole())) {
            if (!studentRepository.existsByRollNumber(req.getRollNumber())) {
                Student student = new Student();
                student.setName(req.getName());
                student.setRollNumber(req.getRollNumber());
                student.setCourse(req.getCourse());
                student.setSection(req.getSection());
                student.setDepartment("");
                student.setPassword(passwordEncoder.encode(req.getPassword()));
                studentRepository.save(student);
            }
        }

        return "Registration successful. Please login.";
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(
            token, user.getRole().name(),
            user.getName(), user.getEmail(), user.getId()
        );
    }
}