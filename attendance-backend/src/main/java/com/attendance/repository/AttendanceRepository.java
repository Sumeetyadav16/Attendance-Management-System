package com.attendance.repository;

import com.attendance.model.Attendance;
import com.attendance.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByStudent_IdAndDate(Long studentId, LocalDate date);

    List<Attendance> findByStudent_IdOrderByDateDesc(Long studentId);

    List<Attendance> findByStudent_Id(Long studentId);

    List<Attendance> findByStudent_IdAndSubject(Long studentId, String subject);

    List<Attendance> findByDate(LocalDate date);

    long countByStudent_IdAndStatus(Long studentId, AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    long countTotalByStudentId(Long studentId);

    // ✅ ADD THIS (IMPORTANT)
    void deleteByStudent_Id(Long studentId);
}