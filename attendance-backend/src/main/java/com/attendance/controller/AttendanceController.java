package com.attendance.controller;

import com.attendance.dto.AttendanceReportDTO;
import com.attendance.model.Attendance;
import com.attendance.repository.StudentRepository;
import com.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StudentRepository studentRepository;

    // ── Manual attendance ──
    @PostMapping("/mark")
    public ResponseEntity<?> markManual(
            @RequestParam Long studentId,
            @RequestParam String date,
            @RequestParam(defaultValue = "PRESENT") String status,
            @RequestParam(defaultValue = "General") String subject) {
        try {
            String result = attendanceService.markManual(
                studentId, date, status, subject);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Face recognition attendance ──
    @PostMapping("/face")
    public ResponseEntity<?> markByFace(
            @RequestParam("image") MultipartFile image) {
        try {
            // Send image to Python Flask
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() { return "capture.jpg"; }
            });

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:5000/recognize",
                new HttpEntity<>(body, headers),
                Map.class
            );

            Map<String, Object> result = response.getBody();

            if (result != null && Boolean.TRUE.equals(result.get("success"))) {
                String faceLabel = (String) result.get("faceLabel");

                var studentOpt = studentRepository.findByFaceLabel(faceLabel);
                if (studentOpt.isEmpty()) {
                    return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Student not found for label: " + faceLabel
                    ));
                }

                var student = studentOpt.get();

                // Use userRepository via service to mark attendance
                String markResult = attendanceService.markByFace(student.getId());

                result.put("student",    student.getName());
                result.put("rollNumber", student.getRollNumber());
                result.put("alreadyMarked",
                    markResult.contains("already"));
                result.put("message",
                    markResult.contains("already")
                        ? student.getName() + " already marked today."
                        : "✅ Attendance marked for " + student.getName());
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    // ── Train face model ──
    @PostMapping("/train")
    public ResponseEntity<?> trainModel() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "http://localhost:5000/train", null, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Python server not running: " + e.getMessage()
            ));
        }
    }

    // ── Get by date ──
    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> byDate(@PathVariable String date) {
        return ResponseEntity.ok(attendanceService.getByDate(date));
    }

    // ── Get by student ──
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> byStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getByStudent(studentId));
    }

    // ── Report ──
    @GetMapping("/report/{studentId}")
    public ResponseEntity<AttendanceReportDTO> report(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getReport(studentId));
    }
}