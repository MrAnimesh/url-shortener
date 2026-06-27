package com.urlshortner.controller;

import java.net.URI;

import com.urlshortner.config.IpConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

//import com.urlshortner.config.IpConfig;
import com.urlshortner.entity.Url;
import com.urlshortner.exception.UrlException;
import com.urlshortner.service.UrlServiceImpl;
//import com.urlshortner.util.IPAddressUtil;
import com.urlshortner.validation.UrlValidator;

import jakarta.servlet.http.HttpServletRequest;

@Controller
//@RestController
public class ShortUrlController {
	

    @Autowired
    private UrlServiceImpl urlService;
    @Autowired 
    private UrlValidator urlValidator;
    @Autowired
    private Environment environment;
    
    @Autowired
    private IpConfig ipConfig;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
//    private IPAddressUtil addressUtil;
	
    @GetMapping("/{shortCode}")
    public String redirectToOriginalUrl(@PathVariable String shortCode, HttpServletRequest request, Model model) throws UrlException {
        if (!urlService.isRequestedUrlExists(shortCode)) {
            throw new UrlException("Short URL does not exist or It has been deleted.");
        }

        if (!urlService.isEnabledOrDisabled(shortCode)) {
            throw new UrlException("This URL has been disabled by the owner.");
        }

        Url url = urlService.getOriginalUrl(shortCode);
        if (url == null) {
            throw new UrlException("Original URL not found.");
        }
        if(url.getPassword() != null && !url.getPassword().isEmpty()) {
        	model.addAttribute("shortCode", shortCode);
        	return "verify-password";
        }
        
        String clientIp = getClientIpAddress(request);
    	urlService.incrementClickCount(url);

//        return new RedirectView(url.getOriginalUrl());
        return buildRedirect(url.getOriginalUrl());  // redirect to original URL

    }
    @PostMapping("/verify-password")
    public String verifyPassword(
            @RequestParam String shortCode,
            @RequestParam String password,
            Model model) throws UrlException {

        Url url = urlService.getOriginalUrl(shortCode);

        if (!passwordEncoder.matches(password, url.getPassword())) {
            model.addAttribute("shortCode", shortCode);
            model.addAttribute("error", "Incorrect password");
            return "verify-password"; // Show error again
        }
        
    	urlService.incrementClickCount(url);

        return buildRedirect(url.getOriginalUrl()); // Success: redirect to original URL
    }



    private String buildRedirect(String originalUrl) throws UrlException {
        try {
            URI uri = URI.create(originalUrl);
            String scheme = uri.getScheme();

            if (scheme == null || uri.getHost() == null) {
                throw new UrlException("Redirect URL is invalid.");
            }

            if (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https")) {
                throw new UrlException("Redirect URL scheme is not allowed.");
            }

            return "redirect:" + uri;
        } catch (IllegalArgumentException ex) {
            throw new UrlException("Redirect URL is invalid.");
        }
    }

		
	private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            String add =  request.getRemoteAddr();
            ipConfig.setupIpInfo(add);
            return add;
        }
        return xForwardedForHeader.split(",")[0];
    }
}
