package com.injamam.interviewjournal.controller;

import com.injamam.interviewjournal.dto.RegisterUserRequest;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    // ==========================================
    // CURRENT LOGGED-IN USER
    // ==========================================

    @GetMapping("/me")
    public User getCurrentUser(Authentication authentication) {

        return userService.getUserByEmail(
                authentication.getName()
        );
    }


    // ==========================================
    // CREATE USER
    // ==========================================

    @PostMapping
    public User createUser(
            @RequestBody RegisterUserRequest request) {

        return userService.saveUser(request);
    }


    // ==========================================
    // GET ALL USERS - ADMIN
    // ==========================================

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }


    // ==========================================
    // GET USER BY ID - ADMIN
    // ==========================================

    @GetMapping("/{id}")
    public User getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }


    // ==========================================
    // UPDATE USER - ADMIN
    // ==========================================

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser) {

        return userService.updateUser(
                id,
                updatedUser
        );
    }


    // ==========================================
    // DELETE USER - ADMIN
    // ==========================================

    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return "User deleted successfully";
    }
}