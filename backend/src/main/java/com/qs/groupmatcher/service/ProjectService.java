package com.qs.groupmatcher.service;

import com.qs.groupmatcher.dto.CreateProjectRequest;
import com.qs.groupmatcher.dto.ProjectDetailResponse;
import com.qs.groupmatcher.dto.ProjectSummaryResponse;
import com.qs.groupmatcher.exception.BusinessRuleException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.Project;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.ProjectRepository;
import com.qs.groupmatcher.repository.UserRepository;
import com.qs.groupmatcher.service.grouping.GroupFormationStrategy;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupFormationStrategy groupFormationStrategy;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            GroupFormationStrategy groupFormationStrategy) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.groupFormationStrategy = groupFormationStrategy;
    }

    /**
     * Creates a project and immediately splits the selected students into groups,
     * all in one transaction: either the project and every group are saved, or nothing is.
     */
    @Transactional
    public ProjectDetailResponse createProject(CreateProjectRequest request) {
        User teacher = userRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.teacherId()));
        if (!teacher.hasRole(Role.TEACHER)) {
            throw new BusinessRuleException("Only teachers can create projects");
        }

        List<User> students = loadStudents(request.studentIds());

        Project project = new Project(
                request.name().strip(),
                normalizeDescription(request.description()),
                request.groupSize(),
                teacher);
        groupFormationStrategy.formGroups(students, request.groupSize())
                .forEach(project::addGroup);

        return ProjectDetailResponse.from(projectRepository.save(project));
    }

    public ProjectDetailResponse getProject(Long id) {
        return projectRepository.findById(id)
                .map(ProjectDetailResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    public List<ProjectSummaryResponse> listProjectsForTeacher(Long teacherId) {
        return projectRepository.findSummariesByTeacherId(teacherId);
    }

    /** Loads the students in the order requested, rejecting duplicates, unknown ids and non-students. */
    private List<User> loadStudents(List<Long> studentIds) {
        Set<Long> uniqueIds = new LinkedHashSet<>(studentIds);
        if (uniqueIds.size() != studentIds.size()) {
            throw new BusinessRuleException("The same student was selected more than once");
        }

        Map<Long, User> found = userRepository.findAllById(uniqueIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<Long> missing = uniqueIds.stream().filter(id -> !found.containsKey(id)).toList();
        if (!missing.isEmpty()) {
            throw new ResourceNotFoundException("Students", missing);
        }

        List<User> students = uniqueIds.stream().map(found::get).toList();
        List<Long> notStudents = students.stream()
                .filter(user -> !user.hasRole(Role.STUDENT))
                .map(User::getId)
                .toList();
        if (!notStudents.isEmpty()) {
            throw new BusinessRuleException("These users are not students: " + notStudents);
        }
        return students;
    }

    private static String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        return description.strip();
    }
}
