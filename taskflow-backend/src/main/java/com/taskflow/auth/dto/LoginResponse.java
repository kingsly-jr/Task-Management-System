package com.taskflow.auth.dto;

public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UserSummaryDto user;
    private String portalPath;

    public LoginResponse() {}

    public LoginResponse(String accessToken, String refreshToken, String tokenType, UserSummaryDto user, String portalPath) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.user = user;
        this.portalPath = portalPath;
    }

    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }

    public static class LoginResponseBuilder {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private UserSummaryDto user;
        private String portalPath;

        public LoginResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public LoginResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public LoginResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public LoginResponseBuilder user(UserSummaryDto user) { this.user = user; return this; }
        public LoginResponseBuilder portalPath(String portalPath) { this.portalPath = portalPath; return this; }

        public LoginResponse build() {
            return new LoginResponse(accessToken, refreshToken, tokenType, user, portalPath);
        }
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }
    public String getPortalPath() { return portalPath; }
    public void setPortalPath(String portalPath) { this.portalPath = portalPath; }
}
