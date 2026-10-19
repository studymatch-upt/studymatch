package com.qs.groupmatcher.controller;

import com.qs.groupmatcher.dto.EnrollmentRequest;
import com.qs.groupmatcher.dto.EnrollmentResponse;
import com.qs.groupmatcher.dto.GradeUpdateRequest;
import com.qs.groupmatcher.service.EnrollmentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/students/{studentId}/enrollments")
public class EnrollmentController {

    private final EnrollmentService service;

    public EnrollmentController(EnrollmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> add(@PathVariable Long studentId,
                                                  @Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse created = service.add(studentId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public List<EnrollmentResponse> list(@PathVariable Long studentId) {
        return service.list(studentId);
    }

    @PutMapping("/{enrollmentId}")
    public EnrollmentResponse updateGrade(@PathVariable Long studentId, @PathVariable Long enrollmentId,
                                          @Valid @RequestBody GradeUpdateRequest request) {
        return service.updateGrade(studentId, enrollmentId, request);
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> delete(@PathVariable Long studentId, @PathVariable Long enrollmentId) {
        service.delete(studentId, enrollmentId);
        return ResponseEntity.noContent().build();
    }
}
