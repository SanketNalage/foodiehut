package com.foodiehut.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    private boolean success = false;
    private String message;
    private int status;
    private LocalDateTime timestamp = LocalDateTime.now();
    private Map<String, String> fieldErrors;

    public ErrorResponse() {}

    public ErrorResponse(String message, int status) {
        this.message = message;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String message, int status, Map<String, String> fieldErrors) {
        this.message = message;
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.timestamp = LocalDateTime.now();
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Map<String, String> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(Map<String, String> fieldErrors) { this.fieldErrors = fieldErrors; }
}

