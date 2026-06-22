package com.urlshortner.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {
    @Bean
    RouteLocator applicationRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("UserMS-payments", route -> route
                        .path("/api/v1/payments/**")
                        .uri("lb://UserMS"))
                .route("UserMS-workers", route -> route
                        .path("/admin/workers/**", "/admin/workers")
                        .uri("lb://UserMS"))
                .build();
    }
}
