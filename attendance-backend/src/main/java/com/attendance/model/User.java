package com.attendance.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt hashed

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // STUDENT, FACULTY

    // Only for STUDENT role
    private String rollNumber;
    private String course;
    private String section;

    // Path to profile/face images folder
    // e.g. /uploads/students/3/
    private String imageFolderPath;
}