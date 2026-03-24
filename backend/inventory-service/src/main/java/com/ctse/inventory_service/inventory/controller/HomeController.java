package com.ctse.inventory_service.inventory.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping(value = {"", "/"}, produces = MediaType.TEXT_PLAIN_VALUE)
    public String home() {
        return "Inventory Service is Running";
    }
}
