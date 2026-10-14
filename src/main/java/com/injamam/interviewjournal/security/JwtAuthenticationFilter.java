package com.injamam.interviewjournal.security;

import com.injamam.interviewjournal.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        System.out.println("Header = " + authHeader);

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("JWT NOT FOUND");

            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("JWT FOUND");

        String jwt = authHeader.substring(7);

        String username =
                jwtService.extractUsername(jwt);

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

        if (jwtService.isTokenValid(jwt, userDetails)) {

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println("================================");
            System.out.println(
                    "Authenticated User : "
                            + authentication.getName()
            );
            System.out.println(
                    "Authorities        : "
                            + authentication.getAuthorities()
            );
            System.out.println("================================");

            System.out.println(
                    "User = "
                            + authentication.getName()
            );

            System.out.println(
                    "Authorities = "
                            + authentication.getAuthorities()
            );
        }

        filterChain.doFilter(request, response);
    }
}