package employee_management_system_backend.security.jwt;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

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
        
        String role = null;

        // Check Bearer Token
        if (
            authHeader != null
            &&
            authHeader.startsWith(
                    "Bearer "
            )
        ) {

        	token = authHeader.substring(7);

        	try {

        	    email = jwtUtil.extractEmail(token);
        	    
        	     role =
        	            jwtUtil.extractRole(token);

        } catch (ExpiredJwtException e) {

        	    response.setStatus(
        	            HttpServletResponse.SC_UNAUTHORIZED
        	    );

        	    response.getWriter().write(
        	            "JWT Token Expired"
        	    );

	    return;

        } catch (JwtException | IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Invalid authentication token\"}");
            return;
        }
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
            	                List.of(
            	                        new SimpleGrantedAuthority(
            	                                "ROLE_" + role
            	                        )
            	                )
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
