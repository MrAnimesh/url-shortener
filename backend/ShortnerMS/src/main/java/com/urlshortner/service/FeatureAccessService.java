package com.urlshortner.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
public class FeatureAccessService {
    public static final Map<String, Set<String>>featureMap = Map.of(
            "FREE", Set.of("CREATE_SHORT_URL", "DELETE_URL"),
            "PREMIUM", Set.of("CREATE_SHORT_URL", "DELETE_URL", "ACTIVATION", "CUSTOM_ALIAS",
                    "SET_PASSWORD", "SET_EXPIRE", "SET_EXPIRE_TIME", "SET_MAX_CLICK", "REPLACE", "ADMIN_PANEL")
    );

    public boolean isFeatureAllowed(String subscription_type, String feature){
        return featureMap.getOrDefault(subscription_type, Set.of()).contains(feature);
    }
}
