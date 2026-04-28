package com.urlshortner.dto;

import lombok.Data;

@Data
public class SuccessResponse<T> implements ApiResponse{
    private String status;
    private String message;
    private T data;

    public SuccessResponse(String status, String message, T data){
        this.message = message;
        this.status = status;
        this.data = data;
    }
}
