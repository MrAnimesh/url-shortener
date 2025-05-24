package com.urlshortner.refreshservice;

import lombok.Data;

@Data
public class TokenRefreshRequest {
  private String refreshToken;
//  private String email;

//  public String getRefreshToken() {
//    return refreshToken;
//  }
//
//  public void setRefreshToken(String refreshToken) {
//    this.refreshToken = refreshToken;
//  }
}
