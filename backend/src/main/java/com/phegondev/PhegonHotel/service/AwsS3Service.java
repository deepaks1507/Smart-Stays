package com.phegondev.PhegonHotel.service;

import com.phegondev.PhegonHotel.exception.OurException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class AwsS3Service {

    @Value("${app.upload.dir:uploads/room-images}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:4040}")
    private String baseUrl;

    public String saveImageToS3(MultipartFile photo) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = photo.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(photo.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return baseUrl + "/images/" + filename;

        } catch (IOException e) {
            throw new OurException("Unable to save image locally: " + e.getMessage());
        }
    }
}
