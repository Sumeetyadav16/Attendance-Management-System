package com.attendance.service;

import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional // ✅ IMPORTANT (fixes delete error)
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ─────────────────────────────
    // ADD STUDENT (BASIC)
    // ─────────────────────────────
    public Student addStudent(String rollNumber, String name,
                              String department, String password) {

        if (studentRepository.existsByRollNumber(rollNumber)) {
            throw new RuntimeException("Roll number already exists: " + rollNumber);
        }

        Student s = new Student();
        s.setRollNumber(rollNumber);
        s.setName(name);
        s.setDepartment(department);
        s.setPassword(password);

        return studentRepository.save(s);
    }

    // ─────────────────────────────
    // ADD STUDENT (FULL WITH FACE LABEL)
    // ─────────────────────────────
    public Student addStudentFull(String rollNumber, String name,
                                  String department, String password,
                                  String course, String section,
                                  String faceLabel) {

        if (studentRepository.existsByRollNumber(rollNumber)) {
            throw new RuntimeException("Roll number already exists: " + rollNumber);
        }

        Student s = new Student();
        s.setRollNumber(rollNumber);
        s.setName(name);
        s.setDepartment(department != null ? department : "");
        s.setPassword(password != null ? password : "1234");
        s.setCourse(course);
        s.setSection(section);
        s.setFaceLabel(faceLabel);

        return studentRepository.save(s);
    }

    // ─────────────────────────────
    // GET ALL STUDENTS
    // ─────────────────────────────
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // ─────────────────────────────
    // GET STUDENT BY ID
    // ─────────────────────────────
    public Student getById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));
    }

    // ─────────────────────────────
    // DELETE STUDENT (WITH ATTENDANCE CLEANUP)
    // ─────────────────────────────
    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found: " + id);
        }

        // ✅ Delete attendance first (avoids FK errors)
        attendanceRepository.deleteByStudent_Id(id);

        // ✅ Then delete student
        studentRepository.deleteById(id);
    }

    // ─────────────────────────────
    // SAVE STUDENT IMAGE
    // ─────────────────────────────
    public String saveImage(Long studentId, MultipartFile file) throws IOException {

        Path folder = Paths.get(uploadDir, "students", String.valueOf(studentId));
        Files.createDirectories(folder);

        String filename = UUID.randomUUID() + ".jpg";
        Path destination = folder.resolve(filename);

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return destination.toString();
    }
}