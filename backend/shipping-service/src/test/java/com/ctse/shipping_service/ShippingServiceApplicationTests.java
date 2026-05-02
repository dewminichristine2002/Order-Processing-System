package com.ctse.shipping_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.ctse.shipping.ShippingServiceApplication;

@SpringBootTest(
		classes = ShippingServiceApplication.class,
		properties = {
				"debug=false",
				"logging.level.root=INFO",
				"logging.level.org.springframework=INFO",
				"spring.jpa.open-in-view=false"
		})
@ActiveProfiles("test")
class ShippingServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
