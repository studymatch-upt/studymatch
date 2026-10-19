package com.qs.groupmatcher.controller;

import com.qs.groupmatcher.dto.CourseUnitRequest;
import com.qs.groupmatcher.dto.CourseUnitResponse;
import com.qs.groupmatcher.service.CourseUnitService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/course-units")
public class CourseUnitController {

    private final CourseUnitService service;

    public CourseUnitController(CourseUnitService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CourseUnitResponse> create(@Valid @RequestBody CourseUnitRequest request) {
        CourseUnitResponse created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping
    public List<CourseUnitResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public CourseUnitResponse get(@PathVariable Long id) {
        return service.get(id);
    }
}
