package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.model.ProjectGroup;
import java.util.List;

public record GroupResponse(Long id, int number, String name, List<UserResponse> members) {

    public static GroupResponse from(ProjectGroup group) {
        return new GroupResponse(
                group.getId(),
                group.getNumber(),
                group.getDisplayName(),
                group.getMembers().stream().map(UserResponse::from).toList());
    }
}
