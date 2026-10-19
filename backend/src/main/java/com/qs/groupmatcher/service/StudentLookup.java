package com.qs.groupmatcher.service;

import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.UserRepository;
import org.springframework.stereotype.Component;

/** One place that answers "does this student exist?" for every service that works on one. */
@Component
public class StudentLookup {

    private final UserRepository userRepository;

    public StudentLookup(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** @throws ResourceNotFoundException if there is no user with that id, or it is not a student */
    public User requireStudent(Long studentId) {
        return userRepository.findByIdAndRole(studentId, Role.STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
    }
}
