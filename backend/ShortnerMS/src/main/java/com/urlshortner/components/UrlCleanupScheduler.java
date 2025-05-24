package com.urlshortner.components;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.urlshortner.repository.UrlRepository;

@Component
public class UrlCleanupScheduler {
	
	@Autowired
	private UrlRepository urlRepository;
	
//	@Scheduled(cron = "0 0 0 * * ?")
//	@Scheduled(cron = "0 */2 * * * ?", zone = "Asia/Kolkata")
	@Scheduled(cron = "0 13 21 * * ?", zone = "Asia/Kolkata")
	public void cleanupAnonymousUrls() {
		urlRepository.deleteOldAnonymousUrls();
	}
	
	@Scheduled(cron = "0 26 23 * * ?", zone = "Asia/Kolkata")
	public void deactivateUrl() {
		urlRepository.deactivateAtUserSpecifiedTime();
	}
}
