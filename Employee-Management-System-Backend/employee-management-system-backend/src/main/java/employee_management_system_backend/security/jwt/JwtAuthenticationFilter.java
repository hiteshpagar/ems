package employee_management_system_backend.security.jwt;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(

            HttpServletRequest request,

            HttpServletResponse response,

            FilterChain filterChain

    ) throws ServletException, IOException {

        // Get Authorization Header
        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        String token = null;

        String email = null;

        // Check Bearer Token
        if (
            authHeader != null
            &&
            authHeader.startsWith(
                    "Bearer "
            )
        ) {

            token =
                    authHeader.substring(7);

            email =
                    jwtUtil.extractEmail(token);
        }

        // Validate User
        if (
            email != null
            &&
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    == null
        ) {

            if (
                jwtUtil.validateToken(
                        token,
                        email
                )
            ) {

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                null
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authToken);
            }
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}