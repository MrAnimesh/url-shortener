package com.urlshortner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class GatewayMsApplication {

    @GetMapping("/hi")
    public String hello()
    {
        return "Hello";
    }
    public static void main(String[] args) {
        SpringApplication.run(GatewayMsApplication.class, args);
    }

}