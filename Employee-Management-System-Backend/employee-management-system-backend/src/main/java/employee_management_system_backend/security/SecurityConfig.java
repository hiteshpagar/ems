package employee_management_system_backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import employee_management_system_backend.security.jwt.JwtAuthenticationFilter;

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
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Logged In Employee Profile
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/employees/me"
                ).authenticated()

                // Read All Employees (Admin and Super Admin)
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/employees/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Leave Allocations (Admin and Super Admin)
                .requestMatchers(
                        "/api/leaves/allocations",
                        "/api/leaves/allocations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

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
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Approve / Reject Leave
                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/leaves/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Delete Leave
                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/leaves/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

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
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/departments/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/departments/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/departments/**"
                ).authenticated()

                // Designation APIs
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/designations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/designations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/designations/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/designations/**"
                ).authenticated()

                // Holiday APIs
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/holidays/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/holidays/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/holidays/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/holidays/**"
                ).authenticated()

                // Dashboard APIs
                .requestMatchers(
                        "/api/dashboard/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Audit Log APIs (Admin and Super Admin)
                .requestMatchers(
                        "/api/audit-logs/**"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Notification APIs
                .requestMatchers("/api/notifications/**").authenticated()

                // Payroll APIs
                .requestMatchers(
                        "/api/payroll/salary-structures/**",
                        "/api/payroll/generate",
                        "/api/payroll/payslips"
                ).hasAnyRole("ADMIN", "SUPER_ADMIN")

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
