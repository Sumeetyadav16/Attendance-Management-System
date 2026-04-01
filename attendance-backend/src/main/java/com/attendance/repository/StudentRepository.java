package com.attendance.repository;

import com.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByRollNumberAndPassword(String rollNumber, String password);
    boolean existsByRollNumber(String rollNumber);
    Optional<Student> findByFaceLabel(String faceLabel); // ← add this
}