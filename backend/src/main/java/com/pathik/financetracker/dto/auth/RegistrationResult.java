package com.pathik.financetracker.dto.auth;

public record RegistrationResult(
        UserResponse user,
        String accessToken,
        long expiresIn
) {
}
