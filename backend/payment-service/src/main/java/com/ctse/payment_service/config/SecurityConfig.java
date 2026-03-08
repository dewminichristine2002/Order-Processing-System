package com.ctse.payment_service.config;

import com.ctse.payment_service.security.ApiKeyAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

/**
 * Spring Security configuration for the payment-service.
 *
 * Security decisions:
 *  - STATELESS sessions: REST API uses no HttpSession / cookies.
 *  - CSRF disabled: safe for stateless APIs (no session cookies).
 *  - CORS handled via the CorsConfigurationSource bean in CorsConfig.
 *  - API key filter: validates X-Internal-API-Key when present; rejects wrong keys.
 *  - Permit all for payment & Swagger endpoints (accessible from browser/frontend).
 *  - Actuator health/info are public for Kubernetes liveness & readiness probes.
 *  - Secure response headers: HSTS, no-sniff, X-Frame-Options DENY, CSP, Referrer-Policy.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final ApiKeyAuthFilter apiKeyAuthFilter;

    public SecurityConfig(ApiKeyAuthFilter apiKeyAuthFilter) {
        this.apiKeyAuthFilter = apiKeyAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ── No server-side sessions ──────────────────────────────────────
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ── CSRF: disabled for stateless REST API ─────────────────────────
            .csrf(AbstractHttpConfigurer::disable)

            // ── CORS: delegate to CorsConfigurationSource bean in CorsConfig ──
            .cors(Customizer.withDefaults())

            // ── Security response headers ─────────────────────────────────────
            .headers(headers -> headers
                // Prevent clickjacking
                .frameOptions(fo -> fo.deny())
                // Prevent MIME-type sniffing
                .contentTypeOptions(ct -> {
                })
                // HSTS: force HTTPS for 1 year, include subdomains
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31_536_000))
                // CSP: this is a backend REST API – no external resources needed
                .contentSecurityPolicy(csp ->
                    csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                // Referrer: send no referrer information
                .referrerPolicy(rp ->
                    rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                // Permissions: disable browser features not used by this API
                .permissionsPolicy(pp ->
                    pp.policy("camera=(), microphone=(), geolocation=(), payment=()"))
            )

            // ── API key filter (runs before standard auth chain) ──────────────
            .addFilterBefore(apiKeyAuthFilter,
                UsernamePasswordAuthenticationFilter.class)

            // ── Authorisation rules ───────────────────────────────────────────
            .authorizeHttpRequests(auth -> auth
                // Kubernetes probes – no auth required
                .requestMatchers(
                    "/actuator/health",
                    "/actuator/health/**",
                    "/actuator/info"
                ).permitAll()
                // Swagger / OpenAPI documentation – accessible without auth
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                // Payment endpoints – accessible from frontend and internal services.
                // Network-level isolation (Kubernetes NetworkPolicy) is the primary
                // ingress control mechanism; API key auth is applied on top.
                .requestMatchers("/payments/**").permitAll()
                // Anything else requires a valid API key (ROLE_SERVICE)
                .anyRequest().hasRole("SERVICE")
            );

        return http.build();
    }
}
