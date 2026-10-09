package com.pathik.financetracker.service;

import com.pathik.financetracker.dto.auth.*;
import com.pathik.financetracker.entity.User;
import com.pathik.financetracker.exception.BusinessException;
import com.pathik.financetracker.exception.DuplicateResourceException;
import com.pathik.financetracker.exception.InvalidCredentialsException;
import com.pathik.financetracker.exception.ResourceNotFoundException;
import com.pathik.financetracker.mapper.UserMapper;
import com.pathik.financetracker.repository.UserRepository;
import com.pathik.financetracker.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserMapper userMapper;

    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.jwtService=jwtService;
    }


    public RegistrationResult register(UserRegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPreferredCurrency(request.preferredCurrency());

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                false
        );

        long expiresIn = jwtService.getExpirationMillis(false) / 1000;

        return new RegistrationResult(
                userMapper.toResponse(savedUser),
                token,
                expiresIn
        );
    }


    public LoginResult login(UserLoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException(
                        "Invalid email or password"
                ));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        boolean rememberMe = request.rememberMe();

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                rememberMe
        );

        long expiresIn = jwtService.getExpirationMillis(rememberMe) / 1000;

        return new LoginResult(token, expiresIn);
    }


    public UserResponse getCurrentUser(UUID userId) {
        User user=userRepository.findById(userId)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id: "+userId));

        return userMapper.toResponse(user);
    }

    public UserResponse updateCurrentUser(UUID userId, UserUpdateRequest request){
        User user=userRepository.findById(userId)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id: "+userId));

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPreferredCurrency(request.preferredCurrency());

        User updatedUser=userRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    public void changePassword(UUID userId, ChangePasswordRequest request){
        User user=userRepository.findById(userId)
                .orElseThrow(()->new ResourceNotFoundException("User not found with id: "+userId));

        if(!passwordEncoder.matches(request.currentPassword(),user.getPasswordHash())){
            throw new BusinessException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));

        userRepository.save(user);
    }
}

