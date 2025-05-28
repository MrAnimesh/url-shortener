package com.urlshortner.controller;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping(value = "/api")
public class UserController {
	
	
	
	@GetMapping("/hello")
	public String hello() {
		return "Hello";
	}
	
	

}
