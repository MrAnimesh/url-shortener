package com.urlshortner.controller;

import com.urlshortner.dto.*;
import com.urlshortner.security.UserDetailsImpl;
import com.urlshortner.service.WorkerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/workers")
@PreAuthorize("hasRole('ADMIN') and hasAuthority('SUBSCRIPTION_PREMIUM')")
public class WorkerController {
    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PostMapping
    public ResponseEntity<WorkerResponse> createWorker(
            @AuthenticationPrincipal UserDetailsImpl admin,
            @RequestBody @Valid WorkerCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workerService.createWorker(admin.getId(), request));
    }

    @GetMapping
    public List<WorkerResponse> getWorkers(@AuthenticationPrincipal UserDetailsImpl admin) {
        return workerService.getWorkers(admin.getId());
    }

    @GetMapping("/{id}")
    public WorkerResponse getWorker(@AuthenticationPrincipal UserDetailsImpl admin, @PathVariable Long id) {
        return workerService.getWorker(admin.getId(), id);
    }

    @PutMapping("/{id}")
    public WorkerResponse updateWorker(@AuthenticationPrincipal UserDetailsImpl admin,
                                       @PathVariable Long id,
                                       @RequestBody @Valid WorkerUpdateRequest request) {
        return workerService.updateWorker(admin.getId(), id, request);
    }

    @PatchMapping("/{id}/status")
    public WorkerResponse updateStatus(@AuthenticationPrincipal UserDetailsImpl admin,
                                       @PathVariable Long id,
                                       @RequestBody @Valid WorkerStatusRequest request) {
        return workerService.updateStatus(admin.getId(), id, request.getEnabled());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disableWorker(@AuthenticationPrincipal UserDetailsImpl admin,
                                              @PathVariable Long id) {
        workerService.disableWorker(admin.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions")
    public List<PermissionResponse> addPermissions(@AuthenticationPrincipal UserDetailsImpl admin,
                                                   @PathVariable Long id,
                                                   @RequestBody @Valid PermissionUpdateRequest request) {
        return workerService.addPermissions(admin.getId(), id, request.getPermissions());
    }

    @PutMapping("/{id}/permissions")
    public List<PermissionResponse> replacePermissions(@AuthenticationPrincipal UserDetailsImpl admin,
                                                       @PathVariable Long id,
                                                       @RequestBody @Valid PermissionUpdateRequest request) {
        return workerService.replacePermissions(admin.getId(), id, request.getPermissions());
    }

    @GetMapping("/{id}/permissions")
    public List<PermissionResponse> getPermissions(@AuthenticationPrincipal UserDetailsImpl admin,
                                                   @PathVariable Long id) {
        return workerService.getPermissions(admin.getId(), id);
    }

    @DeleteMapping("/{id}/permissions/{permissionId}")
    public ResponseEntity<Void> removePermission(@AuthenticationPrincipal UserDetailsImpl admin,
                                                 @PathVariable Long id,
                                                 @PathVariable Long permissionId) {
        workerService.removePermission(admin.getId(), id, permissionId);
        return ResponseEntity.noContent().build();
    }
}
