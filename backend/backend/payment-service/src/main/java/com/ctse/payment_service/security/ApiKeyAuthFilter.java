package com.ctse.payment_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.MessageDigest;
import java.util.List;

/**
 * Validates the {@code X-Internal-API-Key} header on every protected request.
 *
 * Security design:
 * - Actuator health/info endpoints are excluded so Kubernetes probes always work.
 * - Swagger UI / OpenAPI docs endpoints are excluded so the API docs remain browsable.
 * - Constant-time comparison via MessageDigest.isEqual prevents timing-side-channel attacks.
 * - An invalid (non-empty but wrong) key is rejected with 401.
 * - Requests without the header are passed through unauthenticated; the
 *   SecurityConfig authorization rules then decide whether to permit them.
 */
@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    public static final String API_KEY_HEADER = "X-Internal-API-Key";

    @Value("${app.internalApiKey}")
    private String configuredApiKey;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip filter for Kubernetes probes and Swagger/OpenAPI docs
        return path.startsWith("/actuator/health")
            || path.startsWith("/actuator/info")
            || path.startsWith("/swagger-ui")
            || path.startsWith("/v3/api-docs")
            || path.equals("/swagger-ui.html");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String providedKey = request.getHeader(API_KEY_HEADER);

        if (providedKey != null && !providedKey.isEmpty()) {
            // Key was provided – validate it
            if (!isKeyValid(providedKey)) {
                // Non-empty but wrong key: reject immediately
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Unauthorized – invalid API key\"}");
                return;
            }
            // Valid key: authenticate the request as an internal service call
            var auth = new UsernamePasswordAuthenticationToken(
                    "internal-service",
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_SERVICE"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        // No key provided: pass through unauthenticated (SecurityConfig.permitAll handles it)

        filterChain.doFilter(request, response);
    }

    /** Constant-time comparison to prevent timing side-channel attacks. */
    private boolean isKeyValid(String provided) {
        if (configuredApiKey == null) {
            return false;
        }
        return MessageDigest.isEqual(
                provided.getBytes(),
                configuredApiKey.getBytes()
        );
    }
}
