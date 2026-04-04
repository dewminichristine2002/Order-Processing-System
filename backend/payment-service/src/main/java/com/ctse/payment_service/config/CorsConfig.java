package com.ctse.payment_service.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS configuration.
 *
 * Returns a {@link CorsConfigurationSource} bean so that Spring Security's
 * {@code .cors(Customizer.withDefaults())} in SecurityConfig can pick it up
 * automatically.  This is the Spring-recommended approach for Spring Security 6+.
 *
 * Security hardening:
 * - Explicit header allowlist instead of wildcard "*" (wildcard + credentials=true is OWASP risk).
 * - X-Internal-API-Key is included so the frontend can send it to authenticate.
 * - maxAge caches the preflight result for 1 hour to reduce preflight round-trips.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "https://black-wave-076c3e100.4.azurestaticapps.net"
        ));

        // Explicit header allowlist – never use "*" alongside allowCredentials=true
        config.setAllowedHeaders(List.of(
                "Content-Type",
                "Accept",
                "Origin",
                "X-Internal-API-Key"
        ));

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
