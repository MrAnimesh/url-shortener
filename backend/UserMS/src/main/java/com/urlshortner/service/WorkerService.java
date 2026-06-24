package com.urlshortner.service;

import com.urlshortner.dto.*;
import com.urlshortner.entity.Permission;
import com.urlshortner.entity.UserPermission;
import com.urlshortner.entity.Users;
import com.urlshortner.entity.VerificationToken;
import com.urlshortner.enums.PermissionName;
import com.urlshortner.enums.Role;
import com.urlshortner.repository.PermissionRepository;
import com.urlshortner.repository.UserPermissionRepository;
import com.urlshortner.repository.UserRepository;
import com.urlshortner.repository.VerificationTokenRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class WorkerService {
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public WorkerService(UserRepository userRepository,
                         PermissionRepository permissionRepository,
                         UserPermissionRepository userPermissionRepository,
                         VerificationTokenRepository verificationTokenRepository,
                         PasswordEncoder passwordEncoder,
                         EmailService emailService) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public WorkerResponse createWorker(Long adminId, WorkerCreateRequest request) {
        Users admin = userRepository.findById(adminId)
                .orElseThrow(() -> notFound("Admin not found"));
        ensureAdmin(admin);
        ensureUniqueContact(request.getEmail(), request.getMobileNo(), null);

        Users worker = new Users();
        worker.setUsername(request.getUsername().trim());
        worker.setEmail(request.getEmail().trim().toLowerCase());
        worker.setMobileNo(normalizeMobile(request.getMobileNo()));
        worker.setPassword(passwordEncoder.encode(request.getPassword()));
        worker.setRole(Role.ROLE_WORKER);
        worker.setCreatedBy(admin);
        worker.setVerified(false);
        worker.setEnabled(true);

        Users savedWorker;
        try {
            savedWorker = userRepository.save(worker);
        } catch (DataIntegrityViolationException exception) {
            throw translateDatabaseConstraint(exception);
        }

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUsers(savedWorker);
        verificationToken.setToken(token);
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmailToWorker(savedWorker.getEmail(), token);
        return toWorkerResponse(savedWorker);
    }

    @Transactional(readOnly = true)
    public List<WorkerResponse> getWorkers(Long adminId) {
        return userRepository.findByCreatedByIdAndRoleOrderByCreatedAtDesc(adminId, Role.ROLE_WORKER)
                .stream()
                .map(this::toWorkerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkerResponse getWorker(Long adminId, Long workerId) {
        return toWorkerResponse(getOwnedWorker(adminId, workerId));
    }

    public WorkerResponse updateWorker(Long adminId, Long workerId, WorkerUpdateRequest request) {
        Users worker = getOwnedWorker(adminId, workerId);
        ensureUniqueContact(request.getEmail(), request.getMobileNo(), workerId);

        worker.setUsername(request.getUsername().trim());
        worker.setEmail(request.getEmail().trim().toLowerCase());
        worker.setMobileNo(normalizeMobile(request.getMobileNo()));
        try {
            return toWorkerResponse(userRepository.save(worker));
        } catch (DataIntegrityViolationException exception) {
            throw translateDatabaseConstraint(exception);
        }
    }

    public WorkerResponse updateStatus(Long adminId, Long workerId, boolean enabled) {
        Users worker = getOwnedWorker(adminId, workerId);
        worker.setEnabled(enabled);
        return toWorkerResponse(userRepository.save(worker));
    }

    public void disableWorker(Long adminId, Long workerId) {
        Users worker = getOwnedWorker(adminId, workerId);
        worker.setEnabled(false);
        userRepository.save(worker);
    }

    public List<PermissionResponse> addPermissions(Long adminId, Long workerId, Set<PermissionName> names) {
        Users worker = getOwnedWorker(adminId, workerId);
        List<Permission> permissions = resolvePermissions(names);
        Set<PermissionName> assigned = userPermissionRepository.findByUserId(workerId).stream()
                .map(userPermission -> userPermission.getPermission().getName())
                .collect(java.util.stream.Collectors.toSet());

        for (Permission permission : permissions) {
            if (!assigned.contains(permission.getName())) {
                UserPermission assignment = new UserPermission();
                assignment.setUser(worker);
                assignment.setPermission(permission);
                userPermissionRepository.save(assignment);
            }
        }
        return getPermissionResponses(workerId);
    }

    public List<PermissionResponse> replacePermissions(Long adminId, Long workerId, Set<PermissionName> names) {
        Users worker = getOwnedWorker(adminId, workerId);
        List<Permission> permissions = resolvePermissions(names);
        userPermissionRepository.deleteByUserId(workerId);
        userPermissionRepository.flush();

        for (Permission permission : permissions) {
            UserPermission assignment = new UserPermission();
            assignment.setUser(worker);
            assignment.setPermission(permission);
            userPermissionRepository.save(assignment);
        }
        return getPermissionResponses(workerId);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissions(Long adminId, Long workerId) {
        getOwnedWorker(adminId, workerId);
        return getPermissionResponses(workerId);
    }

    public void removePermission(Long adminId, Long workerId, Long permissionId) {
        getOwnedWorker(adminId, workerId);
        UserPermission assignment = userPermissionRepository.findByUserIdAndPermissionId(workerId, permissionId)
                .orElseThrow(() -> notFound("Permission assignment not found"));
        userPermissionRepository.delete(assignment);
    }

    private Users getOwnedWorker(Long adminId, Long workerId) {
        Users worker = userRepository.findById(workerId)
                .orElseThrow(() -> notFound("Worker not found"));
        if (worker.getRole() != Role.ROLE_WORKER || worker.getCreatedBy() == null
                || !worker.getCreatedBy().getId().equals(adminId)) {
            throw new AccessDeniedException("Access denied: worker belongs to another admin");
        }
        return worker;
    }

    private void ensureAdmin(Users user) {
        if (user.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only administrators can create workers");
        }
    }

    private void ensureUniqueContact(String email, String mobileNo, Long workerId) {
        String normalizedEmail = email.trim().toLowerCase();
        String normalizedMobile = normalizeMobile(mobileNo);
        boolean emailExists = workerId == null
                ? userRepository.existsByEmail(normalizedEmail)
                : userRepository.existsByEmailAndIdNot(normalizedEmail, workerId);
        boolean mobileExists = normalizedMobile != null && (workerId == null
                ? userRepository.existsByMobileNo(normalizedMobile)
                : userRepository.existsByMobileNoAndIdNot(normalizedMobile, workerId));
        if (emailExists || mobileExists) {
            throw conflict("Email or mobile number is already in use");
        }
    }

    private List<Permission> resolvePermissions(Set<PermissionName> names) {
        if (names == null || names.isEmpty()) {
            return List.of();
        }
        List<Permission> permissions = permissionRepository.findByNameIn(names);
        if (permissions.size() != names.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more permissions are invalid");
        }
        return permissions;
    }

    private WorkerResponse toWorkerResponse(Users worker) {
        return new WorkerResponse(
                worker.getId(), worker.getUsername(), worker.getEmail(), worker.getMobileNo(),
                "WORKER", worker.isEnabled(), worker.getCreatedBy().getId(),
                getPermissionResponses(worker.getId()), worker.getCreatedAt(), worker.getUpdatedAt());
    }

    private List<PermissionResponse> getPermissionResponses(Long workerId) {
        List<PermissionResponse> responses = new ArrayList<>();
        for (UserPermission assignment : userPermissionRepository.findByUserId(workerId)) {
            Permission permission = assignment.getPermission();
            responses.add(new PermissionResponse(permission.getId(), permission.getName(), permission.getDescription()));
        }
        responses.sort(Comparator.comparing(response -> response.name().name()));
        return responses;
    }

    private String normalizeMobile(String mobileNo) {
        return mobileNo == null || mobileNo.isBlank() ? null : mobileNo.trim();
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private ResponseStatusException translateDatabaseConstraint(DataIntegrityViolationException exception) {
        String databaseMessage = exception.getMostSpecificCause().getMessage();
        if (databaseMessage != null && databaseMessage.contains("users_role_check")) {
            return new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "The database role constraint is outdated. Apply the pending database migration.",
                    exception);
        }
        return new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email or mobile number is already in use",
                exception);
    }
}
