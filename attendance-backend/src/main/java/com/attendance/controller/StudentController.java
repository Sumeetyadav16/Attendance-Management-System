package com.attendance.controller;

import com.attendance.model.Student;
import com.attendance.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Map<String, String> body) {
        try {
            Student s = studentService.addStudent(
                body.get("rollNumber"),
                body.get("name"),
                body.get("department"),
                body.getOrDefault("password", "1234")
            );
            return ResponseEntity.ok(s);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getById(id));
    }

    // ── DELETE student ──────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Delete failed: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String path = studentService.saveImage(id, file);
            return ResponseEntity.ok(Map.of("message", "Image saved", "path", path));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}