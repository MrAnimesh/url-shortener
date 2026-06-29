package com.urlshortner.exception;

public class UrlLimitExceededException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public UrlLimitExceededException(String message) {
        super(message);
    }
}
