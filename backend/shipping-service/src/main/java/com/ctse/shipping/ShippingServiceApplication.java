package com.ctse.shipping_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.ctse.shipping_service", "com.ctse.shipping"})
@EntityScan(basePackages = "com.ctse.shipping.model")
@EnableJpaRepositories(basePackages = "com.ctse.shipping.repository")
@EnableFeignClients(basePackages = "com.ctse.shipping.client")
public class ShippingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShippingServiceApplication.class, args);
	}

}
