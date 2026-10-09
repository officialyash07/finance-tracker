package com.pathik.financetracker.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey signingKey;

    @Getter
    private final long expirationMillis;

    private final long rememberMeExpirationMillis;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMillis,
            @Value("${jwt.remember-me-expiration-ms}") long rememberMeExpirationMillis
    ) {
        if (expirationMillis <= 0 || rememberMeExpirationMillis <= 0) {
            throw new IllegalArgumentException(
                    "JWT expiration durations must be greater than zero."
            );
        }

        if (rememberMeExpirationMillis < expirationMillis) {
            throw new IllegalArgumentException(
                    "Remember-me expiration must be at least as long as the default expiration."
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationMillis = expirationMillis;
        this.rememberMeExpirationMillis = rememberMeExpirationMillis;
    }

    public String generateToken(UUID userId, String email) {
        return generateToken(userId, email, false);
    }

    public String generateToken(
            UUID userId,
            String email,
            boolean rememberMe
    ) {
        long tokenExpirationMillis = rememberMe
                ? rememberMeExpirationMillis
                : expirationMillis;

        Instant now = Instant.now();
        Instant expiration = now.plusMillis(tokenExpirationMillis);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(signingKey)
                .compact();
    }

    public long getExpirationMillis(boolean rememberMe) {
        return rememberMe
                ? rememberMeExpirationMillis
                : expirationMillis;
    }

    public UUID extractUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();

        return UUID.fromString(subject);
    }
}
