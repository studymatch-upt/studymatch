package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.model.User;

public record StudentResponse(Long id, String name, String email, String studentNumber, Integer curricularYear) {

    public static StudentResponse from(User user) {
        return new StudentResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getStudentNumber(),
                user.getCurricularYear());
    }
}
