package com.injamam.interviewjournal.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void supportsA32ByteRawSecret() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(
                jwtService,
                "secret",
                "abcdefghijklmnopqrstuvwx12345678"
        );
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 60_000L);

        var user = User.withUsername("user@example.com")
                .password("ignored")
                .roles("USER")
                .build();

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
    }
}
