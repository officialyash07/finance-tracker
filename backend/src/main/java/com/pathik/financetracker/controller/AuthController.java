package com.pathik.financetracker.controller;

import com.pathik.financetracker.dto.auth.*;
import com.pathik.financetracker.service.LoginResult;
import com.pathik.financetracker.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String ACCESS_TOKEN_COOKIE = "access_token";

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie-same-site:Lax}")
    private String cookieSameSite;

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(
            @Valid @RequestBody UserRegisterRequest request,
            HttpServletResponse response
    ) {
        RegistrationResult result = userService.register(request);

        addAccessTokenCookie(response, result.accessToken(), result.expiresIn());

        return result.user();
    }


    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody UserLoginRequest request,
            HttpServletResponse response
    ) {
        LoginResult result = userService.login(request);

        addAccessTokenCookie(response, result.accessToken(), result.expiresIn());

        return new LoginResponse(result.expiresIn());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        addAccessTokenCookie(response, "", 0);
    }

    private void addAccessTokenCookie(
            HttpServletResponse response,
            String token,
            long maxAgeSeconds
    ) {
        ResponseCookie cookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite(cookieSameSite)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }
}