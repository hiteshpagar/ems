

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // Allow Auth APIs
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                // Allow All APIs for now
                .anyRequest().permitAll()
            )

            .formLogin(form -> form.disable());

        return http.build();
    }
}