package com.urlshortner.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkerUpdateRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @Email(message = "Email is invalid")
    @NotBlank(message = "Email is required")
    private String email;

    private String mobileNo;
}
