package com.taskflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableJpaAuditing
public class TaskFlowApplication {

    public static void main(String[] args) {
        System.setProperty("spring.classformat.ignore", "true");
        loadEnv();
        SpringApplication.run(TaskFlowApplication.class, args);
    }

    private static void loadEnv() {
        Path[] possiblePaths = new Path[]{
            Paths.get(".env"),
            Paths.get("taskflow-backend/.env"),
            Paths.get("../.env")
        };

        for (Path path : possiblePaths) {
            if (Files.isRegularFile(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int separatorIndex = trimmed.indexOf('=');
                        if (separatorIndex > 0) {
                            String key = trimmed.substring(0, separatorIndex).trim();
                            String value = trimmed.substring(separatorIndex + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("[TaskFlow] Loaded environment variables from: " + path.toAbsolutePath().normalize());
                    break;
                } catch (IOException e) {
                    System.err.println("[TaskFlow] Warning: Could not read .env from " + path + ": " + e.getMessage());
                }
            }
        }
    }
}
