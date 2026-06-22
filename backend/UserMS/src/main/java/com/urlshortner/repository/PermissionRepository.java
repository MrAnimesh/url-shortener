package com.urlshortner.repository;

import com.urlshortner.entity.Permission;
import com.urlshortner.enums.PermissionName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByName(PermissionName name);

    List<Permission> findByNameIn(Collection<PermissionName> names);
}
