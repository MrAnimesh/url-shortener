package com.urlshortner.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PublicUrlStatsDto {
    private long linksShortened;
    private long clicksTracked;
}
