package com.urlshortner.config;

import com.urlshortner.entity.Permission;
import com.urlshortner.enums.PermissionName;
import com.urlshortner.repository.PermissionRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PermissionSeeder implements ApplicationRunner {
    private final PermissionRepository permissionRepository;

    public PermissionSeeder(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (PermissionName permissionName : PermissionName.values()) {
            if (permissionRepository.findByName(permissionName).isEmpty()) {
                Permission permission = new Permission();
                permission.setName(permissionName);
                permission.setDescription(permissionName.getDescription());
                permissionRepository.save(permission);
            }
        }
    }
}
