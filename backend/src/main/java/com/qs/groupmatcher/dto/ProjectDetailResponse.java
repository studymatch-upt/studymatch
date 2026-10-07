package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.model.Project;
import java.time.Instant;
import java.util.List;

public record ProjectDetailResponse(
        Long id,
        String name,
        String description,
        int groupSize,
        UserResponse teacher,
        Instant createdAt,
        List<GroupResponse> groups) {

    public static ProjectDetailResponse from(Project project) {
        return new ProjectDetailResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getGroupSize(),
                UserResponse.from(project.getTeacher()),
                project.getCreatedAt(),
                project.getGroups().stream().map(GroupResponse::from).toList());
    }
}
