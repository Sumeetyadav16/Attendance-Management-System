package com.attendance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AttendanceReportDTO {
    private Long   studentId;
    private String studentName;
    private String rollNumber;
    private long   totalClasses;
    private long   presentCount;
    private long   absentCount;
    private String percentage;
}