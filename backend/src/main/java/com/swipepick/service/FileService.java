package com.swipepick.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Slf4j
@Service
public class FileService {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:}")
    private String baseUrl;

    public String upload(MultipartFile file) throws IOException {
        Path dir = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        log.info("Saved: {}", filename);
        return baseUrl + "/uploads/" + filename;
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx).toLowerCase() : ".jpg";
    }
}
