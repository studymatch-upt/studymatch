package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;

public record UserResponse(Long id, String name, String email, Role role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
