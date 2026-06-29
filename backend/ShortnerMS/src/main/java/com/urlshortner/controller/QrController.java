package com.urlshortner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.dto.QrDetailResponse;
import com.urlshortner.dto.QrGenerateRequest;
import com.urlshortner.service.QrService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@Validated
@RestController
@RequestMapping("/api/v1/qr")
@PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('QR_CODE'))")
public class QrController {
    private final QrService qrService;

    public QrController(QrService qrService) {
        this.qrService = qrService;
    }

    @PostMapping
    public ResponseEntity<QrDetailResponse> generateQr(
            @Valid @RequestBody QrGenerateRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(qrService.generateQr(request.getUrlId(), userId));
    }

    @GetMapping("/{urlId}")
    public ResponseEntity<QrDetailResponse> getQr(
            @PathVariable @Positive Long urlId,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(qrService.getQr(urlId, userId));
    }
}
