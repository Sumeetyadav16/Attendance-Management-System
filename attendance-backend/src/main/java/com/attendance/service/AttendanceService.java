package com.attendance.service;

import com.attendance.dto.AttendanceReportDTO;
import com.attendance.model.*;
import com.attendance.repository.AttendanceRepository;
import com.attendance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    // ── Existing method (keep as is) ──
    public String markManual(Long studentId, String subject, String status) {
        AttendanceStatus attendanceStatus =
                status.equalsIgnoreCase("present") ?
                        AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
        return markAttendance(studentId, subject, attendanceStatus, MarkingMethod.MANUAL);
    }

    // ── Existing core method (keep as is) ──
    public String markAttendance(Long studentId, String subject,
                                 AttendanceStatus status,
                                 MarkingMethod method) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        LocalDate today = LocalDate.now();

        boolean alreadyMarked = attendanceRepository
                .findByStudent_IdAndDate(studentId, today)
                .isPresent();

        if (alreadyMarked) {
            return "Attendance already marked for today";
        }

        Attendance attendance = Attendance.builder()
                .student(student)
                .date(today)
                .markedAt(LocalTime.now())
                .subject(subject)
                .status(status)
                .method(method)
                .build();

        attendanceRepository.save(attendance);
        return "Attendance marked successfully";
    }

    // ── NEW: mark by studentId only (for face recognition) ──
    public String markByFace(Long studentId) {
        return markAttendance(
            studentId, "Face Recognition",
            AttendanceStatus.PRESENT, MarkingMethod.FACE
        );
    }

    // ── Overloaded markManual with date (for controller) ──
    public String markManual(Long studentId, String date, String status, String subject) {
        AttendanceStatus attendanceStatus =
                status.equalsIgnoreCase("present") ?
                        AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
        return markAttendance(studentId,
            subject != null ? subject : "General",
            attendanceStatus, MarkingMethod.MANUAL);
    }

    // ── Get by date ──
    public List<Attendance> getByDate(String date) {
        return attendanceRepository.findByDate(LocalDate.parse(date));
    }

    // ── Get by student ──
    public List<Attendance> getByStudent(Long studentId) {
        return attendanceRepository.findByStudent_IdOrderByDateDesc(studentId);
    }

    // ── Report — returns DTO ──
    public AttendanceReportDTO getReport(Long studentId) {
    // Try User table first
    String name = "Unknown";
    String roll = "—";

    try {
        User user = userRepository.findById(studentId).orElse(null);
        if (user != null) {
            name = user.getName();
            roll = user.getRollNumber() != null ? user.getRollNumber() : "—";
        }
    } catch (Exception ignored) {}

    long total   = attendanceRepository.countTotalByStudentId(studentId);
    long present = attendanceRepository.countByStudent_IdAndStatus(
                       studentId, AttendanceStatus.PRESENT);
    long absent  = total - present;
    String pct   = total == 0 ? "0.00"
                 : String.format("%.2f", (present * 100.0) / total);

    return new AttendanceReportDTO(
        studentId, name, roll,
        total, present, absent, pct
    );
}
}