package com.attendance.repository;

import com.attendance.model.FaceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FaceImageRepository extends JpaRepository<FaceImage, Long> {
    List<FaceImage> findByUserId(Long userId);
    long countByUserId(Long userId);
}