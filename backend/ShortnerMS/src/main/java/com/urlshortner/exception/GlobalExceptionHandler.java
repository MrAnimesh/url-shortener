package com.urlshortner.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.urlshortner.dto.ErrorResponse;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UrlException.class)
    public ResponseEntity<String> handleUrlException(UrlException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("<h2>" + ex.getMessage() + "</h2>");
    }

    @ExceptionHandler(QrCodeException.class)
    public ResponseEntity<ErrorResponse> handleQrCodeException(QrCodeException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(new ErrorResponse("FAILED", ex.getMessage()));
    }

    @ExceptionHandler(UrlLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleUrlLimitExceededException(UrlLimitExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("FAILED", ex.getMessage()));
    }
}
