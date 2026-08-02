package employee_management_system_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin("*")
public class FileUploadController {

    @PostMapping
    public Map<String, String> uploadFile(
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image to upload.");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Profile image must be 5 MB or smaller.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files can be uploaded.");
        }

        Path uploadPath =
                Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = file.getOriginalFilename() == null ? "photo" : file.getOriginalFilename();
        String extension = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')).replaceAll("[^A-Za-z0-9.]", "")
                : ".jpg";
        String fileName = UUID.randomUUID() + extension;

        Path filePath =
                uploadPath.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath
        );

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "photoUrl",
                "/uploads/" + fileName
        );

        return response;
    }
}
