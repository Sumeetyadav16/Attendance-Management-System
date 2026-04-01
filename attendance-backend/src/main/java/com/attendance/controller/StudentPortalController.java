package com.attendance.controller;

import com.attendance.service.StudentPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentPortalController {

    private final StudentPortalService portalService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = portalService.login(
                body.get("rollNumber"), body.get("password"));
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401)
                .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/percentage/{studentId}")
    public ResponseEntity<?> getPercentage(@PathVariable Long studentId) {
        return ResponseEntity.ok(portalService.getSubjectWisePercentage(studentId));
    }

    @GetMapping("/report/{studentId}/{subject}")
    public ResponseEntity<?> getReport(
            @PathVariable Long studentId,
            @PathVariable String subject) {
        return ResponseEntity.ok(portalService.getDetailedReport(studentId, subject));
    }
}
