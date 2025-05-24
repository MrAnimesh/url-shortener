package com.urlshortner.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.dto.UserDTO;
import com.urlshortner.service.UserService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping(value = "/api")
public class UserController {
	
	
	
	@GetMapping("/hello")
	public String hello() {
		return "Hello";
	}
	
	

}
