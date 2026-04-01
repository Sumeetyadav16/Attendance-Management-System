package com.attendance.service;

import com.attendance.dto.AttendanceReportDTO;
import com.attendance.model.*;
import com.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentPortalService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    // ✅ LOGIN
    public Map<String, Object> login(String rollNumber, String password) {

        User student = userRepository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!student.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }

        return Map.of(
                "id", student.getId(),
                "name", student.getName(),
                "rollNumber", student.getRollNumber()
        );
    }

    // ✅ SUBJECT-WISE %
    public Map<String, Double> getSubjectWisePercentage(Long studentId) {

        List<Attendance> records = attendanceRepository.findByStudent_Id(studentId);

        Map<String, List<Attendance>> grouped =
                records.stream().collect(Collectors.groupingBy(Attendance::getSubject));

        Map<String, Double> result = new HashMap<>();

        for (String subject : grouped.keySet()) {
            List<Attendance> list = grouped.get(subject);

            long present = list.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .count();

            double percentage = list.isEmpty() ? 0 :
                    (present * 100.0) / list.size();

            result.put(subject, Math.round(percentage * 100.0) / 100.0);
        }

        return result;
    }

    // ✅ DETAILED REPORT
    public List<Attendance> getDetailedReport(Long studentId, String subject) {
        return attendanceRepository.findByStudent_IdAndSubject(studentId, subject);
    }

    // ✅ OVERALL REPORT
    public AttendanceReportDTO getStudentReport(Long studentId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        long total = attendanceRepository.countTotalByStudentId(studentId);

        long present = attendanceRepository.countByStudent_IdAndStatus(
                studentId, AttendanceStatus.PRESENT);

        long absent = total - present;

        String percentage = total == 0 ? "0.00"
                : String.format("%.2f", (present * 100.0) / total);

        return new AttendanceReportDTO(
                studentId,
                student.getName(),
                student.getRollNumber(),
                total,
                present,
                absent,
                percentage
        );
    }

    // ✅ HISTORY
    public List<Attendance> getStudentHistory(Long studentId) {
        return attendanceRepository.findByStudent_IdOrderByDateDesc(studentId);
    }
}