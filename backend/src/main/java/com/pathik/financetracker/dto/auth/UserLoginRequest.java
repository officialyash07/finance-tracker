package com.pathik.financetracker.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserLoginRequest(

        @NotBlank
        @Email
        @Size(max = 300)
        String email,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        boolean rememberMe
) {
}
