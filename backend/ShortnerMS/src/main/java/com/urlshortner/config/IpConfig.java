package com.urlshortner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.ipinfo.api.IPinfo;
import io.ipinfo.api.errors.RateLimitedException;
import io.ipinfo.api.model.IPResponse;

@Configuration
public class IpConfig {

	public void setupIpInfo(String ipAddress) {

		IPinfo ipInfo = new IPinfo.Builder()
	            .setToken("dedc303cfa3ac1")
	            .build();

	    try {
	        ipInfo.lookupIP("192.168.1.8");
	    } catch (RateLimitedException ex) {
	        // Handle rate limits here.
	    }
	}


}
