package com.example.tenantmanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiClient {

    private final RestClient restClient;
    private final String apiKey;

    public GeminiClient(@Value("${gemini.api.key}") String apiKey, @Value("${gemini.model}") String model) {
        // Sanitize API Key (remove quotes if present)
        this.apiKey = apiKey.replaceAll("^\"|\"$", "").trim();
        // Sanitize Model Name
        String sanitizedModel = model.replaceAll("^\"|\"$", "").trim();

        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models/" + sanitizedModel
                        + ":generateContent")
                .build();
    }

    public String callGemini(Map<String, Object> requestBody) {
        int maxRetries = 3;
        int retryDelay = 2000; // 2 seconds

        for (int i = 0; i < maxRetries; i++) {
            try {
                return restClient.post()
                        .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .body(String.class);
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                if (e.getStatusCode().value() == 503 || e.getStatusCode().value() == 429) {
                    if (i == maxRetries - 1)
                        throw e; // Throw on last attempt
                    try {
                        Thread.sleep(retryDelay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted during retry", ie);
                    }
                } else {
                    throw e; // Rethrow other errors immediately
                }
            } catch (org.springframework.web.client.HttpServerErrorException e) {
                if (e.getStatusCode().value() == 503) {
                    if (i == maxRetries - 1)
                        throw e;
                    try {
                        Thread.sleep(retryDelay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Interrupted during retry", ie);
                    }
                } else {
                    throw e;
                }
            }
        }
        throw new RuntimeException("Failed to call Gemini API after retries");
    }
}
