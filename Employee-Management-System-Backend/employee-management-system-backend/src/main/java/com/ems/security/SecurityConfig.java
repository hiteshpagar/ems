package com.ems.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ems.security.jwt.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            // Enable CORS for web clients (e.g. Chrome, Expo Web, React Web)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // Disable CSRF
            .csrf(csrf -> csrf.disable())

            // API Authorization Rules
            .authorizeHttpRequests(auth -> auth

                // Preflight OPTIONS requests for CORS must always be permitted
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public APIs
                .requestMatchers(
                        "/api/auth/**",
                        "/uploads/**"
                ).permitAll()

                // Super Admin APIs (Exclusive to SUPER_ADMIN)
                .requestMatchers(
                        "/api/super-admin/**"
                ).hasRole("SUPER_ADMIN")

                // Company Admin APIs (Exclusive to ADMIN)
                .requestMatchers(
                        "/api/admin/**"
                ).hasRole("ADMIN")

                // Profile APIs
                .requestMatchers(
                        "/api/profile/**"
                ).authenticated()

                // Employee Management
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Logged In Employee Profile
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/employees/me"
                ).authenticated()

                // Read All Employees (Admin, Super Admin, HR)
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Leave Allocations (Admin, Super Admin, HR)
                .requestMatchers(
                        "/api/leaves/allocations",
                        "/api/leaves/allocations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Leave APIs
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
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Approve / Reject Leave
                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/leaves/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Delete Leave
                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/leaves/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Attendance APIs
                .requestMatchers(
                        "/api/attendance/**"
                ).authenticated()

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/attendance/me/today"
                ).authenticated()

                // Department APIs
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/departments/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/departments/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/departments/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/departments/**"
                ).authenticated()

                // Designation APIs
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/designations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/designations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/designations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/designations/**"
                ).authenticated()

                // Holiday APIs
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/holidays/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/holidays/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/holidays/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/holidays/**"
                ).authenticated()

                // Dashboard APIs
                .requestMatchers(
                        "/api/dashboard/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Audit Log APIs (Admin, Super Admin, HR)
                .requestMatchers(
                        "/api/audit-logs/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                // Notification APIs
                .requestMatchers("/api/notifications/**").authenticated()

                // Payroll APIs
                .requestMatchers(
                        "/api/payroll/salary-structures/**",
                        "/api/payroll/generate",
                        "/api/payroll/payslips"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN", "HR")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/payroll/payslips/me"
                ).authenticated()

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
