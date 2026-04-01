package com.attendance.controller;

import com.attendance.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageStorageService imageStorageService;

    @PostMapping("/upload/{userId}")
    public ResponseEntity<List<String>> uploadImages(
            @PathVariable Long userId,
            @RequestParam("images") MultipartFile[] images) throws Exception {
        return ResponseEntity.ok(
            imageStorageService.saveMultipleImages(userId, images));
    }

    @GetMapping("/count/{userId}")
    public ResponseEntity<Long> getCount(@PathVariable Long userId) {
        return ResponseEntity.ok(imageStorageService.getImageCount(userId));
    }
}