package com.urlshortner.validation;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

@Component
public class UrlValidator {
	private static final Pattern pattern = Pattern.compile("^[a-zA-Z0-9_-]{3,20}$");
	public boolean isValidCustomUrl(String url) {
		Matcher matcher = pattern.matcher(url);
		return matcher.matches();
	}
	
}
