package com.urlshortner.enums;

public enum PermissionName {
    CREATE_SHORT_URL("Create standard short URLs"),
    DELETE_URL("Delete short URLs"),
    PREMIUM("Reserved premium entitlement"),
    ACTIVATION("Activate and deactivate short URLs"),
    CUSTOM_ALIAS("Create custom URL aliases"),
    SET_PASSWORD("Set and reset URL passwords"),
    SET_EXPIRE("Reset URL expiration"),
    SET_EXPIRE_TIME("Set URL expiration time"),
    SET_MAX_CLICK("Set and reset maximum click limits"),
    REPLACE("Replace a short URL source"),
    QR_CODE("Generate and view QR codes");

    private final String description;

    PermissionName(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
