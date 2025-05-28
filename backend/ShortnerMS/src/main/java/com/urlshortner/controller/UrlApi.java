package com.urlshortner.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

//import com.urlshortner.config.IpConfig;
import com.urlshortner.dto.DeactivationTimeDto;
import com.urlshortner.dto.ReplaceUrlDto;
import com.urlshortner.dto.UrlFetchDto;
import com.urlshortner.dto.UrlFetchForCustomDto;
import com.urlshortner.dto.UrlPasswordDto;
import com.urlshortner.entity.Url;
import com.urlshortner.exception.UrlException;
import com.urlshortner.service.UrlServiceImpl;
//import com.urlshortner.util.IPAddressUtil;
import com.urlshortner.validation.UrlValidator;

import jakarta.servlet.http.HttpServletRequest;
import lombok.Delegate;

@RestController
@RequestMapping("/api/v1/urls")
public class UrlApi {

    @Autowired
    private UrlServiceImpl urlService;
    @Autowired
    private UrlValidator urlValidator;
    @Autowired
    private Environment environment;

//    @Autowired
//    private IpConfig ipConfig;

//    private IPAddressUtil addressUtil;
	@GetMapping("/public/hello")
	public String sayHello() {
		return "Hi";
	}

//    @PostMapping("/public/shorten")
	@PostMapping("/public/short")
    public ResponseEntity<String> createShortUrlPublic(@RequestBody UrlFetchDto fetchDto) throws UrlException, IOException{
    	if(urlService.isValidUrl(fetchDto.getOriginalUrl())) {
    		Url url = urlService.createShortUrl(fetchDto, null);
    		System.out.println(fetchDto.getOriginalUrl());
            return new ResponseEntity<>("http://localhost:8081/"+url.getShortUrl() , HttpStatus.CREATED);
    	}else {
    		System.out.println(fetchDto.getOriginalUrl());
            return new ResponseEntity<>("Invalid Url", HttpStatus.BAD_REQUEST);
    	}


    }
//    @PostMapping("/private/shorten")
	@PostMapping("/short")
    public ResponseEntity<String> createShortUrlPrivate(@RequestBody UrlFetchDto fetchDto, @RequestHeader("X-User-Id") String userId) throws UrlException, IOException{
    	if(urlService.isValidUrl(fetchDto.getOriginalUrl())) {
    	Long uId = Long.parseLong(userId);
        Url url = urlService.createShortUrl(fetchDto, uId);
        System.out.println(fetchDto.getOriginalUrl());
        return new ResponseEntity<>("http://localhost:8081/"+url.getShortUrl() , HttpStatus.CREATED);
    	}else {
    		System.out.println(fetchDto.getOriginalUrl());
            return new ResponseEntity<>("Invalid Url", HttpStatus.BAD_REQUEST);

    	}
    }


    @PostMapping("/custom")
    public ResponseEntity<String> createCustomShortUrl(@RequestBody UrlFetchForCustomDto fetchDto, @RequestHeader("X-User-Id") String userId){

    	Long uId = Long.parseLong(userId);

    	if (urlValidator.isValidCustomUrl(fetchDto.getCustomUrl())) {
	    	if (urlService.createCustomShortUrl(fetchDto, uId)) {
	    		return new ResponseEntity<String>("http://localhost:8081/"+fetchDto.getCustomUrl(),HttpStatus.CREATED);
	    	}
	    	return new ResponseEntity<String>("This Custom Url already exists, Kindly try different one", HttpStatus.CONFLICT);
    	}else {
    		return new ResponseEntity<String>(environment.getProperty("API.WRONG_URL"), HttpStatus.BAD_REQUEST);
    	}
    }

    @DeleteMapping("/delete/{shortCode}")
    public ResponseEntity<String> deleteUrl(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);

    	if (urlService.deleteCreatedUrl(shortCode, uId) > 0) {
    		return new ResponseEntity<String>("Url got deleted", HttpStatus.OK);
    	}else {
    		return new ResponseEntity<String>("Some error occured", HttpStatus.BAD_REQUEST);
    	}

    }

    @PostMapping("/activate/{shortCode}")
    public ResponseEntity<Boolean> urlActivate(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	if(urlService.activateUrl(shortCode, uId)) {
    		return new ResponseEntity<>(true, HttpStatus.OK);
    	}else {
    		return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);

    	}

    }
    @PostMapping("/deactivate/{shortCode}")
    public ResponseEntity<Boolean> deactivateUrl(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	if(urlService.deactivateUrl(shortCode, uId)) {
    		return new ResponseEntity<>(true, HttpStatus.OK);
    	}else {
    		return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);

    	}

    }

//    @GetMapping("/users/{userId}/urls")
    @GetMapping
    public ResponseEntity<List<Url>> getAllUrlOfAUser(@RequestHeader("X-User-Id") String userId){
    	Long Id = Long.parseLong(userId);
    	List<Url> allUrl = urlService.findAllUrls(Id);
    	return new ResponseEntity<>(allUrl, HttpStatus.OK);
    }


    @PutMapping("/replace")
    public ResponseEntity<String> replaceOriginalUrl(@RequestBody ReplaceUrlDto replaceUrlDto, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	urlService.updateOriginalUrl(replaceUrlDto.getShortCode(), replaceUrlDto.getNewUrl(), uId);
    	return new ResponseEntity<String>(replaceUrlDto.getNewUrl(), HttpStatus.OK);
    }

    @PutMapping("/expires")
    public ResponseEntity<String> setUserSpecifiedDeactivationTime(@RequestBody DeactivationTimeDto deactivationTimeDto, @RequestHeader("X-User-Id") String userId){
    	if(deactivationTimeDto.getExpiresAt().isBefore(LocalDateTime.now())) {
    		return new ResponseEntity<String>("Please Provide future deactivation time", HttpStatus.NOT_ACCEPTABLE);
    	}
    	Long uId = Long.parseLong(userId);
    	if(urlService.setDeactivationTimeByUser(deactivationTimeDto.getShortCode(),uId, deactivationTimeDto.getExpiresAt()) == true)
    		return new ResponseEntity<String>("Deactivation time has been set", HttpStatus.OK);
    	else
    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }
    @PutMapping("/resetExpires/{shortCode}")
    public ResponseEntity<String> resetDeactivationTime(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	if(urlService.resetDeactivationTime(shortCode,uId) == true)
    		return new ResponseEntity<String>("Deactivation has been reset", HttpStatus.OK);
    	else
    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @PutMapping("/expires/{shortCode}/{maxClick}")
    public ResponseEntity<String>updateMaxClicksAllowed(@PathVariable("shortCode") String shortCode,
    													@PathVariable("maxClick") Long maxClicks,
    													@RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);

    	if(urlService.updateMaxClicksAllowed(shortCode, uId, maxClicks)) {
    		return new ResponseEntity<>("Successfully updated maxClicks", HttpStatus.OK);
    	}
    	return new ResponseEntity<>("Something went wrong, please refreshpage and try again.", HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/resetClicks/{shortCode}")
    public ResponseEntity<String> resetMaxClicks(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	if(urlService.resetMaxClicks(shortCode,uId) == true)
    		return new ResponseEntity<String>("Max clicks has been reset", HttpStatus.OK);
    	else
    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @PutMapping("/password")
    public ResponseEntity<String> resetMaxClicks(@RequestBody UrlPasswordDto passwordDto, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	if(urlService.setUrlPassword(passwordDto, uId) == true)
    		return new ResponseEntity<String>("Password has been set", HttpStatus.OK);
    	else
    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @PutMapping("/reset-password/{shortCode}")
    public ResponseEntity<String> resetUrlPassword(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);
    	if(urlService.resetUrlPassword(shortCode,uId) == true)
    		return new ResponseEntity<String>("Password has been reset", HttpStatus.OK);
    	else
    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }

//    private String getClientIpAddress(HttpServletRequest request) {
//        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
//        if (xForwardedForHeader == null) {
//            String add =  request.getRemoteAddr();
//            ipConfig.setupIpInfo(add);
//            return add;
//        }
//        return xForwardedForHeader.split(",")[0];
//    }



}
