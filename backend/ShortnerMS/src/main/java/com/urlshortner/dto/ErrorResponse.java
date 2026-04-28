package com.urlshortner.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ErrorResponse implements ApiResponse{
    private String status;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(String status, String message){
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
}
