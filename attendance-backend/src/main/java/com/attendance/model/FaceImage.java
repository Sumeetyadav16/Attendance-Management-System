package com.attendance.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "face_images")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // e.g. uploads/students/3/img_1711234567.jpg
    @Column(nullable = false)
    private String imagePath;

    private boolean usedForTraining;
}