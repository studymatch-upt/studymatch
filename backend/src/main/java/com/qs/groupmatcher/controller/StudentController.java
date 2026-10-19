package com.qs.groupmatcher.controller;

import com.qs.groupmatcher.dto.StudentRequest;
import com.qs.groupmatcher.dto.StudentResponse;
import com.qs.groupmatcher.service.StudentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        StudentResponse created = studentService.create(request);
        return ResponseEntity.created(URI.create("/api/students/" + created.id())).body(created);
    }

    @GetMapping
    public List<StudentResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer curricularYear,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return studentService.list(search, curricularYear, sortBy, direction);
    }

    @GetMapping("/{id}")
    public StudentResponse get(@PathVariable Long id) {
        return studentService.get(id);
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return studentService.update(id, request);
    }
}
