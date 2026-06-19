package employee_management_system_backend.security;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationProvider;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import employee_management_system_backend.security.jwt.JwtAuthenticationFilter;

import org.springframework.http.HttpMethod;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // Disable CSRF
            .csrf(csrf -> csrf.disable())

            // API Authorization Rules
            .authorizeHttpRequests(auth -> auth

            	    // Public APIs
            	    .requestMatchers(
            	            "/api/auth/**",
            	            "/uploads/**"
            	    ).permitAll()

            	    // Employee Management
            	    .requestMatchers(
            	            HttpMethod.POST,
            	            "/api/employees/**"
            	    ).hasRole("ADMIN")

            	    .requestMatchers(
            	            HttpMethod.PUT,
            	            "/api/employees/**"
            	    ).hasRole("ADMIN")

            	    .requestMatchers(
            	            HttpMethod.DELETE,
            	            "/api/employees/**"
            	    ).hasRole("ADMIN")

            	    // Read Employees
            	    .requestMatchers(
            	            HttpMethod.GET,
            	            "/api/employees/**"
            	    ).hasRole("ADMIN")

            	    // Leave APIs
            	 // Apply Leave
            	    .requestMatchers(
            	            HttpMethod.POST,
            	            "/api/leaves"
            	    ).authenticated()

            	    // View Leaves
            	    .requestMatchers(
            	            HttpMethod.GET,
            	            "/api/leaves/**"
            	    ).hasRole("ADMIN")

            	    // Approve / Reject Leave
            	    .requestMatchers(
            	            HttpMethod.PUT,
            	            "/api/leaves/**"
            	    ).hasRole("ADMIN")

            	    // Delete Leave
            	    .requestMatchers(
            	            HttpMethod.DELETE,
            	            "/api/leaves/**"
            	    ).hasRole("ADMIN")

            	    // Attendance APIs
            	    .requestMatchers(
            	            "/api/attendance/**"
            	    ).authenticated()

            	    // Dashboard APIs
            	    .requestMatchers(
            	            "/api/dashboard/**"
            	    ).hasRole("ADMIN")

            	    // Upload APIs
            	    .requestMatchers(
            	            "/api/upload/**"
            	    ).authenticated()

            	    .anyRequest()
            	    .authenticated()
            	)

            // Disable Session
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Add JWT Filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            // Disable Default Login Form
            .formLogin(form -> form.disable());

        return http.build();
    }
}