package com.urlshortner.controller;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.urlshortner.dto.*;
import com.urlshortner.service.FeatureAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.urlshortner.entity.Url;
import com.urlshortner.exception.UrlException;
import com.urlshortner.service.UrlServiceImpl;
//import com.urlshortner.util.IPAddressUtil;
import com.urlshortner.validation.UrlValidator;

import jakarta.validation.Valid;
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

	@Autowired
	private FeatureAccessService featureAccessService;

	@Value("${app.short-url-base}")
	private String shortUrlBase;

//    @Autowired
//    private IpConfig ipConfig;

//    private IPAddressUtil addressUtil;
	@GetMapping("/public/hello")
	public String sayHello() {
		return "Hi";
	}

	@GetMapping("/public/stats")
	public ResponseEntity<PublicUrlStatsDto> getPublicStats() {
		return new ResponseEntity<>(urlService.getPublicStats(), HttpStatus.OK);
	}

//    @PostMapping("/public/shorten")
	@PostMapping("/public/short")
    public ResponseEntity<String> createShortUrlPublic(@Valid @RequestBody UrlFetchDto fetchDto) throws UrlException, IOException{
    	if(urlService.isValidUrl(fetchDto.getOriginalUrl())) {
    		Url url = urlService.createShortUrl(fetchDto, null);
            return new ResponseEntity<>(buildShortUrl(url.getShortUrl()) , HttpStatus.CREATED);
    	}else {
            return new ResponseEntity<>("Invalid Url", HttpStatus.BAD_REQUEST);
    	}


    }
//    @PostMapping("/private/shorten")
    @PostMapping("/short")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CREATE_SHORT_URL')")
    public ResponseEntity<String> createShortUrlPrivate(
            @Valid @RequestBody UrlFetchDto fetchDto,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Subscription") String subscriptionType) throws UrlException, IOException {
    	if(urlService.isValidUrl(fetchDto.getOriginalUrl())) {
    	Long uId = Long.parseLong(userId);
        Url url = urlService.createShortUrl(fetchDto, uId, subscriptionType);
        return new ResponseEntity<>(buildShortUrl(url.getShortUrl()) , HttpStatus.CREATED);
    	}else {
            return new ResponseEntity<>("Invalid Url", HttpStatus.BAD_REQUEST);

    	}
    }


    @PostMapping("/custom")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or (hasAuthority('CREATE_SHORT_URL') and hasAuthority('CUSTOM_ALIAS')))")
    public ResponseEntity<ApiResponse> createCustomShortUrl(@Valid @RequestBody UrlFetchForCustomDto fetchDto, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "CUSTOM_ALIAS";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use custom alias."), HttpStatus.METHOD_NOT_ALLOWED);
//			throw new AccessDeniedException("Upgrade to use custom alias.");
		}

    	Long uId = Long.parseLong(userId);

    	if (urlValidator.isValidCustomUrl(fetchDto.getCustomUrl())) {
	    	if (urlService.createCustomShortUrl(fetchDto, uId)) {
				return new ResponseEntity<>(new SuccessResponse<>(
						"SUCCESS",
						"Url Successfully created",
						buildShortUrl(fetchDto.getCustomUrl())

				), HttpStatus.CREATED);
	    	}
			return new ResponseEntity<>(
					new ErrorResponse("FAILED", "This Custom Url already exists, Kindly try different one"),
					HttpStatus.CONFLICT
			);
//	    	return new ResponseEntity<String>("This Custom Url already exists, Kindly try different one", HttpStatus.CONFLICT);
    	}else {
			return new ResponseEntity<>(
					new ErrorResponse("FAILED", environment.getProperty("API.WRONG_URL")),
					HttpStatus.BAD_REQUEST );
//    		return new ResponseEntity<String>(environment.getProperty("API.WRONG_URL"), HttpStatus.BAD_REQUEST);
    	}
    }

    @DeleteMapping("/delete/{shortCode}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('DELETE_URL')")
    public ResponseEntity<String> deleteUrl(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId){
    	Long uId = Long.parseLong(userId);

    	if (urlService.deleteCreatedUrl(shortCode, uId) > 0) {
    		return new ResponseEntity<String>("Url got deleted", HttpStatus.OK);
    	}else {
    		return new ResponseEntity<String>("Some error occured", HttpStatus.BAD_REQUEST);
    	}

    }

    @PostMapping("/activate/{shortCode}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('ACTIVATION'))")
    public ResponseEntity<ApiResponse> urlActivate(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "ACTIVATION";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Activation/Deactivation."), HttpStatus.METHOD_NOT_ALLOWED);
//			throw new AccessDeniedException("Upgrade to use custom alias.");
		}

    	Long uId = Long.parseLong(userId);
    	if(urlService.activateUrl(shortCode, uId)) {
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Url Successfully Activated",
					true

			), HttpStatus.CREATED);
    	}else {
    		return new ResponseEntity<>(new ErrorResponse("FAILED", "URL not found."),
					HttpStatus.NOT_FOUND
			);

    	}

    }
    @PostMapping("/deactivate/{shortCode}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('ACTIVATION'))")
    public ResponseEntity<ApiResponse> deactivateUrl(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "ACTIVATION";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Activation/Deactivation."), HttpStatus.METHOD_NOT_ALLOWED);
//			throw new AccessDeniedException("Upgrade to use custom alias.");
		}
    	Long uId = Long.parseLong(userId);
    	if(urlService.deactivateUrl(shortCode, uId)) {
    		return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Url Successfully De-activated",
					true

			), HttpStatus.CREATED);
		}else {
			return new ResponseEntity<>(new ErrorResponse("FAILED", "URL not found."),
					HttpStatus.NOT_FOUND
			);

    	}

    }

//    @GetMapping("/users/{userId}/urls")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
	public ResponseEntity<List<UrlDashboardDto>> getAllUrlOfAUser(@RequestHeader("X-User-Id") String userId){
    	Long Id = Long.parseLong(userId);
	    	List<UrlDashboardDto> allUrl = urlService.findAllUrls(Id);
    	return new ResponseEntity<>(allUrl, HttpStatus.OK);
    }


    @PutMapping("/replace")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('REPLACE'))")
    public ResponseEntity<ApiResponse> replaceOriginalUrl(@Valid @RequestBody ReplaceUrlDto replaceUrlDto, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "REPLACE";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}

    	Long uId = Long.parseLong(userId);
    	int updatedRows = urlService.updateOriginalUrl(replaceUrlDto.getShortCode(), replaceUrlDto.getNewUrl(), uId);

		if (updatedRows == 0) {
			return new ResponseEntity<>(new ErrorResponse("FAILED", "URL not found."),
					HttpStatus.NOT_FOUND);
		}

		return new ResponseEntity<>(new SuccessResponse<>(
				"SUCCESS",
				"Source Url Successfully Changed", replaceUrlDto.getNewUrl()

		), HttpStatus.OK);
//    	return new ResponseEntity<String>(replaceUrlDto.getNewUrl(), HttpStatus.OK);
    }

    @PutMapping("/expires")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('SET_EXPIRE_TIME'))")
    public ResponseEntity<ApiResponse> setUserSpecifiedDeactivationTime(@Valid @RequestBody DeactivationTimeDto deactivationTimeDto, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "SET_EXPIRE_TIME";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}

    	if(deactivationTimeDto.getExpiresAt().isBefore(LocalDateTime.now())) {
			return new ResponseEntity<>( new ErrorResponse("error", "Please Provide future deactivation time."), HttpStatus.METHOD_NOT_ALLOWED);
//    		return new ResponseEntity<String>("Please Provide future deactivation time", HttpStatus.NOT_ACCEPTABLE);
    	}
    	Long uId = Long.parseLong(userId);
    	if(urlService.setDeactivationTimeByUser(deactivationTimeDto.getShortCode(),uId, deactivationTimeDto.getExpiresAt()) == true)
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Deactivation time has been set",
					null

			), HttpStatus.OK);
//    		return new ResponseEntity<String>("Deactivation time has been set", HttpStatus.OK);
    	else
			return new ResponseEntity<>( new ErrorResponse("error", "There is some problem, please refresh the page."), HttpStatus.INTERNAL_SERVER_ERROR);

//			return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }
    @PutMapping("/resetExpires/{shortCode}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('SET_EXPIRE_TIME'))")
    public ResponseEntity<ApiResponse> resetDeactivationTime(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "SET_EXPIRE_TIME";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}
    	Long uId = Long.parseLong(userId);
    	if(urlService.resetDeactivationTime(shortCode,uId) == true)
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Deactivation has been reset",
					null

			), HttpStatus.OK);
//    		return new ResponseEntity<String>("Deactivation has been reset", HttpStatus.OK);
    	else
			return new ResponseEntity<>( new ErrorResponse("error", "There is some problem, please refresh the page."), HttpStatus.INTERNAL_SERVER_ERROR);
//    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @PutMapping("/expires/{shortCode}/{maxClick}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('SET_MAX_CLICK'))")
    public ResponseEntity<ApiResponse>updateMaxClicksAllowed(@PathVariable("shortCode") String shortCode,
    													@PathVariable("maxClick") Long maxClicks,
    													@RequestHeader("X-User-Id") String userId,
														@RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "SET_MAX_CLICK";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}
    	Long uId = Long.parseLong(userId);

    	if(urlService.updateMaxClicksAllowed(shortCode, uId, maxClicks)) {
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Successfully updated maxClicks.",
					null

			), HttpStatus.OK);
//    		return new ResponseEntity<>("Successfully updated maxClicks", HttpStatus.OK);
    	}
		return new ResponseEntity<>( new ErrorResponse("error", "Something went wrong, please refresh page and try again."), HttpStatus.BAD_REQUEST);
//    	return new ResponseEntity<>("Something went wrong, please refreshpage and try again.", HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/resetClicks/{shortCode}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('SET_MAX_CLICK'))")
    public ResponseEntity<ApiResponse> resetMaxClicks(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "SET_MAX_CLICK";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}
    	Long uId = Long.parseLong(userId);
    	if(urlService.resetMaxClicks(shortCode,uId) == true)
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Max clicks has been reset",
					null

			), HttpStatus.OK);
//    		return new ResponseEntity<String>("Max clicks has been reset", HttpStatus.OK);
    	else
			return new ResponseEntity<>( new ErrorResponse("error", "There is some problem, please refresh the page."), HttpStatus.INTERNAL_SERVER_ERROR);
//    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }
//	SET_PASSWORD
    @PutMapping("/password")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('SET_PASSWORD'))")
    public ResponseEntity<ApiResponse> resetMaxClicks(@Valid @RequestBody UrlPasswordDto passwordDto, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "SET_PASSWORD";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}
    	Long uId = Long.parseLong(userId);
    	if(urlService.setUrlPassword(passwordDto, uId) == true)
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Password has been set.",
					null

			), HttpStatus.OK);
//    		return new ResponseEntity<String>("Password has been set", HttpStatus.OK);
    	else
			return new ResponseEntity<>( new ErrorResponse("error", "There is some problem, please refresh the page."), HttpStatus.INTERNAL_SERVER_ERROR);
//    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }

    @PutMapping("/reset-password/{shortCode}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_PREMIUM') and (hasRole('ADMIN') or hasAuthority('SET_PASSWORD'))")
    public ResponseEntity<ApiResponse> resetUrlPassword(@PathVariable("shortCode") String shortCode, @RequestHeader("X-User-Id") String userId, @RequestHeader("X-Subscription") String sub_type){

		String requiredFeature = "SET_PASSWORD";

		if(!featureAccessService.isFeatureAllowed(sub_type, requiredFeature)){
			return new ResponseEntity<>( new ErrorResponse("error", "Upgrade to use Premium Features."), HttpStatus.METHOD_NOT_ALLOWED);
		}
    	Long uId = Long.parseLong(userId);
    	if(urlService.resetUrlPassword(shortCode,uId) == true)
			return new ResponseEntity<>(new SuccessResponse<>(
					"SUCCESS",
					"Password has been reset.",
					null

			), HttpStatus.OK);
//    		return new ResponseEntity<String>("Password has been reset", HttpStatus.OK);
    	else
			return new ResponseEntity<>( new ErrorResponse("error", "There is some problem, please refresh the page."), HttpStatus.INTERNAL_SERVER_ERROR);
//    		return new ResponseEntity<String>("There is some problem, please refresh the page.", HttpStatus.INTERNAL_SERVER_ERROR);

    }
	@GetMapping("/getFeatures")
	@PreAuthorize("hasAnyRole('ADMIN', 'WORKER')")
	public ResponseEntity<ApiResponse> getFeaturesAccordingToSubType(@RequestHeader("X-Subscription") String sub_type){
		return new ResponseEntity<>(new SuccessResponse<>(
				"SUCCESS",
				"List of features",
				Map.of("subscriptionType", sub_type,
						"featureList", FeatureAccessService.featureMap.get(sub_type))

		), HttpStatus.OK);
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



	private String buildShortUrl(String shortCode) {
		return shortUrlBase.replaceAll("/+$", "") + "/" + shortCode;
	}

}
