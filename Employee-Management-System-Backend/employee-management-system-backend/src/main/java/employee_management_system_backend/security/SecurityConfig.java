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
            	    
            	 // Profile APIs
            	    .requestMatchers(
            	            "/api/profile/**"
            	    ).authenticated()

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

            	    // Logged In Employee Profile
            	    .requestMatchers(
            	            HttpMethod.GET,
            	            "/api/employees/me"
            	    ).authenticated()

            	    // Read All Employees (Admin Only)
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
            	    
            	 // Logged In Employee Leave History
            	    .requestMatchers(
            	            HttpMethod.GET,
            	            "/api/leaves/me",
            	            "/api/leaves/me/**"
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
            	    
            	    .requestMatchers(
            	            HttpMethod.GET,
            	            "/api/attendance/me/today"
            	    ).authenticated()
            	    
            	 // Department APIs

            	 // Create Department
            	    .requestMatchers(
            	            HttpMethod.POST,
            	            "/api/departments/**"
            	    ).hasRole("ADMIN")
            	 // Update Department
            	 .requestMatchers(
            	         HttpMethod.PUT,
            	         "/api/departments/**"
            	 ).hasRole("ADMIN")

            	 // Delete Department
            	 .requestMatchers(
            	         HttpMethod.DELETE,
            	         "/api/departments/**"
            	 ).hasRole("ADMIN")

            	 // View Departments
            	 .requestMatchers(
            	         HttpMethod.GET,
            	         "/api/departments/**"
            	 ).authenticated()
            	 
            	// Designation APIs

            	// Create Designation
            	.requestMatchers(
            	        HttpMethod.POST,
            	        "/api/designations/**"
            	).hasRole("ADMIN")

            	// Update Designation
            	.requestMatchers(
            	        HttpMethod.PUT,
            	        "/api/designations/**"
            	).hasRole("ADMIN")

            	// Delete Designation
            	.requestMatchers(
            	        HttpMethod.DELETE,
            	        "/api/designations/**"
            	).hasRole("ADMIN")

            	// View Designations
            	.requestMatchers(
            	        HttpMethod.GET,
            	        "/api/designations/**"
            	).authenticated()

            	// Holiday APIs
            	.requestMatchers(
            	        HttpMethod.POST,
            	        "/api/holidays/**"
            	).hasRole("ADMIN")

            	.requestMatchers(
            	        HttpMethod.PUT,
            	        "/api/holidays/**"
            	).hasRole("ADMIN")

            	.requestMatchers(
            	        HttpMethod.DELETE,
            	        "/api/holidays/**"
            	).hasRole("ADMIN")

            	.requestMatchers(
            	        HttpMethod.GET,
            	        "/api/holidays/**"
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
