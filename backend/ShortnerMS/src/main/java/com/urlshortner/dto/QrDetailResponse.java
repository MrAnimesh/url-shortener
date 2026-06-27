package com.urlshortner.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QrDetailResponse {
    private Long id;
    private Long urlId;
    private List<List<Boolean>> grid;
}
