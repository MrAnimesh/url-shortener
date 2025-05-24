package com.urlshortner.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UrlException.class)
    public ResponseEntity<String> handleUrlException(UrlException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("<h2>" + ex.getMessage() + "</h2>");
    }
}
