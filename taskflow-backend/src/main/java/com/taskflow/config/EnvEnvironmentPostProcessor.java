package com.taskflow.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Spring Boot EnvironmentPostProcessor that automatically discovers and loads
 * variables from .env files into Spring's ConfigurableEnvironment before application.yml
 * properties are resolved.
 */
public class EnvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path[] possiblePaths = new Path[]{
            Paths.get(".env"),
            Paths.get("taskflow-backend/.env"),
            Paths.get("../.env")
        };

        for (Path path : possiblePaths) {
            if (Files.isRegularFile(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    Map<String, Object> envMap = new HashMap<>();

                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int separatorIndex = trimmed.indexOf('=');
                        if (separatorIndex > 0) {
                            String key = trimmed.substring(0, separatorIndex).trim();
                            String value = trimmed.substring(separatorIndex + 1).trim();

                            // Strip wrapping single or double quotes
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }

                            envMap.put(key, value);

                            // Also sync to System.setProperty for early lookups
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }

                    if (!envMap.isEmpty()) {
                        environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));
                        System.out.println("[TaskFlow] Successfully loaded " + envMap.size() +
                                " properties from environment file: " + path.toAbsolutePath().normalize());
                    }
                    break;
                } catch (IOException e) {
                    System.err.println("[TaskFlow] Warning: Failed to read .env file from " + path + ": " + e.getMessage());
                }
            }
        }
    }
}
