package com.urlshortner.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@Transactional
public class EmailService {
	
	@Autowired
	private JavaMailSender javaMailSender;
	
	@Value("${spring.mail.username}")
	private String fromEmail;
	
	public void sendVerificationEmial(String toEmail, String verificationToken) {
		
		try {
			MimeMessage message = javaMailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true);
			
			helper.setFrom(fromEmail);
			helper.setTo(toEmail);
			helper.setSubject("UrlShortner - Please Verify Your Email Address");
			String verificationUrl = "http://localhost:3000/api/verify?token="+verificationToken;
			String emailContent = """
				<!DOCTYPE html>
				<html lang="en">
				<head>
				    <meta charset="UTF-8">
				    <meta name="viewport" content="width=device-width, initial-scale=1.0">
				    <title>Email Verification</title>
				    <style>
				        body {
				            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
				            line-height: 1.6;
				            color: #333333;
				            max-width: 600px;
				            margin: 0 auto;
				            padding: 20px;
				        }
				        .container {
				            background-color: #ffffff;
				            border-radius: 8px;
				            padding: 30px;
				            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
				        }
				        .header {
				            text-align: center;
				            margin-bottom: 30px;
				        }
				        .logo {
				            max-width: 150px;
				            margin-bottom: 20px;
				        }
				        h1 {
				            color: #2c3e50;
				            font-size: 24px;
				            font-weight: 600;
				            margin-bottom: 15px;
				        }
				        .button {
				            display: inline-block;
				            background-color: #3498db;
				            color: white;
				            text-decoration: none;
				            padding: 12px 25px;
				            border-radius: 4px;
				            font-weight: 500;
				            margin: 20px 0;
				            text-align: center;
				        }
				        .button:hover {
				            background-color: #2980b9;
				        }
				        .footer {
				            margin-top: 30px;
				            font-size: 14px;
				            color: #7f8c8d;
				            text-align: center;
				        }
				        .divider {
				            border-top: 1px solid #eaeaea;
				            margin: 25px 0;
				        }
				    </style>
				</head>
				<body>
				    <div class="container">
				        <div class="header">
				            <!-- Replace with your company logo if available -->
				            <!-- <img src="your-logo-url.png" alt="Company Logo" class="logo"> -->
				            <h1>Email Verification</h1>
				        </div>
				        
				        <p>Hello,</p>
				        
				        <p>Thank you for signing up! To complete your registration and access your account, please verify your email address.</p>
				        
				        <div style="text-align: center;">
				            <a href="%s" class="button">Verify My Email</a>
				        </div>
				        
				        <p>This verification link will expire in 30 minutes for security reasons.</p>
				        
				        <div class="divider"></div>
				        
				        <p><strong>Why verify?</strong> Email verification helps us confirm your identity and secure your account.</p>
				        
				        <p>If you didn't create an account, please ignore this email or contact our support team if you have concerns.</p>
				        
				        <div class="footer">
				            <p>© 2025 Your Company Name. All rights reserved.</p>
				            <p>123 Business Street, City, Country</p>
				        </div>
				    </div>
				</body>
				</html>
			""".formatted(verificationUrl);
			
			helper.setText(emailContent, true);
			javaMailSender.send(message);
			
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	
}
