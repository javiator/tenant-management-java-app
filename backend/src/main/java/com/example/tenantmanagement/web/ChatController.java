package com.example.tenantmanagement.web;

import com.example.tenantmanagement.service.ChatService;
import com.example.tenantmanagement.web.dto.ChatRequest;
import com.example.tenantmanagement.web.dto.ChatResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String response = chatService.chat(request.getMessage(), request.getSessionId());
        return new ChatResponse(response);
    }
}
