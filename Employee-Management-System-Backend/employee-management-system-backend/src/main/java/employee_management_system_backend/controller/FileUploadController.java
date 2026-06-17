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

        Path uploadPath =
                Paths.get("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName =
                UUID.randomUUID()
                + "_"
                + file.getOriginalFilename();

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