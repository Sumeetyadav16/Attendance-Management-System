package com.attendance.service;

import com.attendance.model.*;
import com.attendance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.ArrayList;


import java.io.IOException;
import java.nio.file.*;

/**
 * Handles saving images to local disk.
 * Images are stored at:
 *   uploads/students/{userId}/img_timestamp.jpg
 *   uploads/faculty/{userId}/img_timestamp.jpg
 *
 * Only the PATH is saved in DB — never the image bytes.
 */
@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private final FaceImageRepository faceImageRepository;
    private final UserRepository userRepository;

    /**
     * Save a single image for a user.
     * Creates folder automatically if it doesn't exist.
     */
    public String saveImage(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Determine folder based on role
        String roleFolder = user.getRole() == Role.STUDENT ? "students" : "faculty";
        String folderPath = "uploads/" + roleFolder + "/" + userId + "/";

        // Auto-create directory
        Path dir = Paths.get(folderPath);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        // Build unique filename
        String filename = "img_" + System.currentTimeMillis() + getExtension(file);
        Path filePath = dir.resolve(filename);

        // Write bytes to disk
        Files.write(filePath, file.getBytes());

        // Save path to DB
        FaceImage faceImage = FaceImage.builder()
            .user(user)
            .imagePath(filePath.toString())
            .usedForTraining(false)
            .build();
        faceImageRepository.save(faceImage);

        // Update user's imageFolderPath if not set
        if (user.getImageFolderPath() == null) {
            user.setImageFolderPath(folderPath);
            userRepository.save(user);
        }

        return filePath.toString();
    }

    /**
     * Save multiple images at once (for registration)
     */
    public List<String> saveMultipleImages(Long userId, MultipartFile[] files) throws IOException {
        if (files.length < 3) {
            throw new RuntimeException("Minimum 3 images required for face registration.");
        }
        List<String> savedPaths = new ArrayList<>();
        for (MultipartFile file : files) {
            savedPaths.add(saveImage(userId, file));
        }
        return savedPaths;
    }

    public long getImageCount(Long userId) {
        return faceImageRepository.countByUserId(userId);
    }

    private String getExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original != null && original.contains("."))
            return original.substring(original.lastIndexOf("."));
        return ".jpg";
    }
}