package com.injamam.interviewjournal.service;

import com.injamam.interviewjournal.dto.RegisterUserRequest;
import com.injamam.interviewjournal.entity.User;
import com.injamam.interviewjournal.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.injamam.interviewjournal.enums.Role;

import java.util.List;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // ==========================================
    // CREATE USER
    // ==========================================

    public User saveUser(RegisterUserRequest request) {

        User user = new User();

        user.setName(request.getName());

        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        /*
         * Every newly registered user starts
         * as a normal USER.
         */
        user.setRole(Role.USER);

        return userRepository.save(user);
    }


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }


    // ==========================================
    // GET ALL USERS
    // ==========================================

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


    // ==========================================
    // GET USER BY ID
    // ==========================================

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElse(null);
    }


    // ==========================================
    // UPDATE USER
    // ==========================================

    public User updateUser(
            Long id,
            User updatedUser) {

        User existingUser =
                userRepository.findById(id)
                        .orElse(null);


        if (existingUser == null) {

            return null;
        }


        /*
         * Update basic user information.
         */

        if (updatedUser.getName() != null) {

            existingUser.setName(
                    updatedUser.getName()
            );

        }


        if (updatedUser.getEmail() != null) {

            existingUser.setEmail(
                    updatedUser.getEmail()
            );

        }


        /*
         * Allow ADMIN to change the role.
         *
         * Example:
         *
         * USER  → ADMIN
         * ADMIN → USER
         */

        if (updatedUser.getRole() != null) {

            existingUser.setRole(
                    updatedUser.getRole()
            );

        }


        return userRepository.save(existingUser);
    }


    // ==========================================
    // DELETE USER
    // ==========================================

    public void deleteUser(Long id) {

        /*
         * Find the user we want to delete.
         */

        User userToDelete =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        /*
         * Find currently logged-in user.
         */

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        String currentUserEmail =
                authentication.getName();


        User currentUser =
                userRepository.findByEmail(
                        currentUserEmail
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Current user not found"
                        )
                );


        /*
         * Prevent an admin from deleting
         * their own account.
         */

        if (currentUser.getId().equals(id)) {

            throw new RuntimeException(
                    "You cannot delete your own account."
            );
        }


        userRepository.delete(userToDelete);
    }
}