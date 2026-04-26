package com.ctse.inventory_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/inventory/**")
                        .allowedOrigins(
                                "http://localhost:3000",
                                "https://black-wave-076c3e100.4.azurestaticapps.net"
                        )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*");

                registry.addMapping("/v3/api-docs/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "https://black-wave-076c3e100.4.azurestaticapps.net"
                    )
                    .allowedMethods("GET", "OPTIONS")
                    .allowedHeaders("*");

                registry.addMapping("/swagger-ui/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "https://black-wave-076c3e100.4.azurestaticapps.net"
                    )
                    .allowedMethods("GET", "OPTIONS")
                    .allowedHeaders("*");
            }
        };
    }
}
