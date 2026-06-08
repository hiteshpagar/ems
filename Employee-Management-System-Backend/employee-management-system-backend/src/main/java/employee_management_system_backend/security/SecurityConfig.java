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
            			    "/api/employees/**",
            			    "/api/leaves/**"
            			).permitAll()

                // Protected APIs
                .anyRequest().authenticated()
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