package com.qs.groupmatcher.controller;

import com.qs.groupmatcher.dto.CreateProjectRequest;
import com.qs.groupmatcher.dto.ProjectDetailResponse;
import com.qs.groupmatcher.dto.ProjectSummaryResponse;
import com.qs.groupmatcher.service.ProjectService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ProjectDetailResponse> create(@Valid @RequestBody CreateProjectRequest request) {
        ProjectDetailResponse created = projectService.createProject(request);
        return ResponseEntity.created(URI.create("/api/projects/" + created.id())).body(created);
    }

    @GetMapping
    public List<ProjectSummaryResponse> listForTeacher(@RequestParam Long teacherId) {
        return projectService.listProjectsForTeacher(teacherId);
    }

    @GetMapping("/{id}")
    public ProjectDetailResponse get(@PathVariable Long id) {
        return projectService.getProject(id);
    }
}
