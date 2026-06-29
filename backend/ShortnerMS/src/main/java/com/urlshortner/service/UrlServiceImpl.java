package com.urlshortner.service;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.urlshortner.dto.UrlDetail;
import com.urlshortner.dto.UrlDto;
import com.urlshortner.dto.UrlFetchDto;
import com.urlshortner.dto.UrlFetchForCustomDto;
import com.urlshortner.dto.UrlPasswordDto;
import com.urlshortner.dto.PublicUrlStatsDto;
import com.urlshortner.dto.UrlDashboardDto;
import com.urlshortner.entity.Url;
import com.urlshortner.exception.UrlException;
import com.urlshortner.exception.UrlLimitExceededException;
import com.urlshortner.repository.QrDetailRepository;
import com.urlshortner.repository.UrlRepository;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.UnknownHostException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class UrlServiceImpl {

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int SHORT_CODE_LENGTH = 6;
    private static final int FREE_URL_LIMIT = 5;
    private Random pickRandom = new Random();
    @Autowired
    private UrlRepository urlRepository;
    @Autowired
    private QrDetailRepository qrDetailRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public PublicUrlStatsDto getPublicStats() {
        long linksShortened = urlRepository.count();
        long clicksTracked = urlRepository.sumClicksTracked();

        return new PublicUrlStatsDto(linksShortened, clicksTracked);
    }

    public Url createShortUrl(UrlFetchDto fetchDto, Long userId) throws UrlException, IOException{
        return createShortUrl(fetchDto, userId, null);
    }

    public Url createShortUrl(UrlFetchDto fetchDto, Long userId, String subscriptionType)
            throws UrlException, IOException {
        boolean isFreeUser = userId != null && "FREE".equalsIgnoreCase(subscriptionType);
        if (isFreeUser && urlRepository.countByUserId(userId) >= FREE_URL_LIMIT) {
            throw new UrlLimitExceededException("Free accounts can create up to 5 short URLs.");
        }

        String shortenUrl = generateShortCode(SHORT_CODE_LENGTH);
        while(urlRepository.existsByShortUrl(shortenUrl)){
            shortenUrl = generateShortCode(SHORT_CODE_LENGTH);
        }
        
        String normalizedUrl = fetchDto.getOriginalUrl();
        
        if(!normalizedUrl.startsWith("https://") && !normalizedUrl.startsWith("http://")) {
        	normalizedUrl = "https://"+normalizedUrl;
        }


        Url url = new Url();
        url.setOriginalUrl(normalizedUrl);
        url.setShortUrl(shortenUrl);
        url.setCount((long) 0);
        url.setUserId(userId);
        url.setCreatedAt(LocalDateTime.now());
        if (isFreeUser) {
            url.setExpiresAt(null);
        }

        return urlRepository.save(url);
    }
    
    public boolean createCustomShortUrl(UrlFetchForCustomDto customDto, Long userId) {
    	if (!urlRepository.existsByShortUrl(customDto.getCustomUrl())) {
    		Url url = new Url();
    		url.setOriginalUrl(customDto.getOriginalUrl());
    		url.setShortUrl(customDto.getCustomUrl());
    		url.setCount((long) 0);
    		url.setUserId(userId);
    		url.setCreatedAt(LocalDateTime.now());
    		
    		urlRepository.save(url);
    		
    		return true;
    	}
    	else {
    		return false;
    	}
    }

    public Url getOriginalUrl(String shortUrl) throws UrlException{

    	Optional<Url> optionalUrl = urlRepository.findByShortUrl(shortUrl);
    	Url url = optionalUrl.orElseThrow(()-> new UrlException("Service.URL_NOT_FOUND"));
    	
    	if(url.getMaxClicksAllowed() != null && url.getCount() >= url.getMaxClicksAllowed()) {
            throw new UrlException("Max number of clicks has been reached, Url is now deactivated.");
    	}
//    	url.setCount(url.getCount()+1);
    	return url;
    	
    }
    
    public void incrementClickCount(Url url) {
        url.setCount(url.getCount() + 1);
        urlRepository.save(url);
    }


    public String generateShortCode(int length){
        StringBuilder sb = new StringBuilder(length);
        for(int i = 0; i < length; i+=1){
           sb.append(CHARACTERS.charAt(pickRandom.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
    
    
    public Integer deleteCreatedUrl(String url, Long userId) {
        Optional<Url> existingUrl = urlRepository.findByShortUrlAndUserId(url, userId);
        if (existingUrl.isEmpty()) {
            return 0;
        }

        qrDetailRepository.deleteByUrlIdAndUserId(existingUrl.get().getId(), userId);
        return urlRepository.deleteByShortUrl(url, userId);
    }
    
    public boolean isRequestedUrlExists(String shortCode) {
    	if(urlRepository.existsByShortUrl(shortCode))
    		return true;
    	return false;
    }
    
    public boolean activateUrl(String shortCode, Long userId) {
    	return urlRepository.activateUrl(shortCode, userId) > 0;
    }

    public boolean deactivateUrl(String shortCode, Long userId) {
    	return urlRepository.deactivateUrl(shortCode, userId) > 0;
    }
    
    public boolean isEnabledOrDisabled(String shortCode) {
    	return urlRepository.isEnabledOrDisabled(shortCode);
    }
    
    public List<UrlDashboardDto> findAllUrls(Long userId){
        return urlRepository.findDashboardUrls(userId);
    }
    
    public int updateOriginalUrl(String shortCode, String newUrl, Long userId) {
    	int updateRowCount = urlRepository.updateOriginalUrl(newUrl, shortCode, userId);
    	return updateRowCount;
    }
    
    public boolean setDeactivationTimeByUser(String shortCode, Long userId, LocalDateTime expiresAt) {
    	if(urlRepository.setUserSpeccifiedDeactivationTime(shortCode, userId, expiresAt) > 0) {
    		return true;
    	}
    	return false;
    }
    public boolean resetDeactivationTime(String shortCode, Long userId) {
    	if(urlRepository.resetDeactivationTime(shortCode, userId) > 0)
    		return true;
    	return false;
    }
    
    public boolean isValidUrl(String inputUrl) {
    	String normalizedUrl = inputUrl;
        
        if(!inputUrl.startsWith("https://") && !inputUrl.startsWith("http://")) {
        	normalizedUrl = "https://"+normalizedUrl;
  
        }
        return true;
    	
//        try {
//            URI uri = URI.create(normalizedUrl);
    }
    
    public boolean updateMaxClicksAllowed(String shortCode, Long userId, Long maxClicks) {
    	if(urlRepository.updateMaxClicksAllowed(shortCode, maxClicks, userId) > 0) {
    		return true;
    	}
    	return false;
    }
    
    public boolean resetMaxClicks(String shortCode, Long userId) {
    	if(urlRepository.resetMaxClicks(shortCode, userId) > 0) {
    		return true;
    	}
    	return false;
    }
    public boolean setUrlPassword(UrlPasswordDto passwordDto, Long userId) {
        String encodedPassword = passwordEncoder.encode(passwordDto.getUrlPassword());
    	if(urlRepository.setUrlPassword(passwordDto.getShortCode(), encodedPassword, userId) > 0) {
    		return true;
    	}
    	return false;
    }
    
    public boolean resetUrlPassword(String shortCode, Long userId) {
    	if(urlRepository.resetUrlPassword(shortCode, userId) > 0) {
    		return true;
    	}
    	return false;    	
    }


}
