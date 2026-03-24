package com.ctse.shipping.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping({"", "/"})
    public String home() {
        return "Shipping Service is Running";
    }
}
