package com.urlshortner.service;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.urlshortner.dto.QrDetailResponse;
import com.urlshortner.entity.QrDetail;
import com.urlshortner.entity.Url;
import com.urlshortner.exception.QrCodeException;
import com.urlshortner.repository.QrDetailRepository;
import com.urlshortner.repository.UrlRepository;

@Service
@Transactional
public class QrService {
    private final QrDetailRepository qrDetailRepository;
    private final UrlRepository urlRepository;
    private final String shortUrlBase;

    public QrService(
            QrDetailRepository qrDetailRepository,
            UrlRepository urlRepository,
            @Value("${app.short-url-base}") String shortUrlBase) {
        this.qrDetailRepository = qrDetailRepository;
        this.urlRepository = urlRepository;
        this.shortUrlBase = shortUrlBase;
    }

    public QrDetailResponse generateQr(Long urlId, Long userId) {
        Url url = findOwnedUrl(urlId, userId);

        return qrDetailRepository.findByUrlIdAndUserId(urlId, userId)
                .map(this::toResponse)
                .orElseGet(() -> createQrDetail(url, userId));
    }

    @Transactional(readOnly = true)
    public QrDetailResponse getQr(Long urlId, Long userId) {
        findOwnedUrl(urlId, userId);

        QrDetail qrDetail = qrDetailRepository.findByUrlIdAndUserId(urlId, userId)
                .orElseThrow(() -> new QrCodeException(HttpStatus.NOT_FOUND, "QR code not found."));

        return toResponse(qrDetail);
    }

    private Url findOwnedUrl(Long urlId, Long userId) {
        return urlRepository.findByIdAndUserId(urlId, userId)
                .orElseThrow(() -> new QrCodeException(HttpStatus.NOT_FOUND, "URL not found."));
    }

    private QrDetailResponse createQrDetail(Url url, Long userId) {
        String publicShortUrl = buildShortUrl(url.getShortUrl());

        QrDetail qrDetail = new QrDetail();
        qrDetail.setUrlId(url.getId());
        qrDetail.setUserId(userId);
        qrDetail.setGrid(generateGrid(publicShortUrl));

        return toResponse(qrDetailRepository.save(qrDetail));
    }

    private List<List<Boolean>> generateGrid(String content) {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.MARGIN, 4);

        try {
            BitMatrix matrix = new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, 1, 1, hints);
            return toBooleanGrid(matrix);
        } catch (WriterException exception) {
            throw new QrCodeException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate QR code.");
        }
    }

    private List<List<Boolean>> toBooleanGrid(BitMatrix matrix) {
        List<List<Boolean>> grid = new ArrayList<>(matrix.getHeight());

        for (int rowIndex = 0; rowIndex < matrix.getHeight(); rowIndex++) {
            List<Boolean> row = new ArrayList<>(matrix.getWidth());
            for (int columnIndex = 0; columnIndex < matrix.getWidth(); columnIndex++) {
                row.add(matrix.get(columnIndex, rowIndex));
            }
            grid.add(row);
        }

        return grid;
    }

    private String buildShortUrl(String shortCode) {
        return shortUrlBase.replaceAll("/+$", "") + "/" + shortCode;
    }

    private QrDetailResponse toResponse(QrDetail qrDetail) {
        return new QrDetailResponse(qrDetail.getId(), qrDetail.getUrlId(), qrDetail.getGrid());
    }
}
