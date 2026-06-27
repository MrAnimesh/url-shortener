package com.urlshortner.exception;

import org.springframework.http.HttpStatus;

public class QrCodeException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public QrCodeException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
