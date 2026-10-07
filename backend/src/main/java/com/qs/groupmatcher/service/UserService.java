package com.qs.groupmatcher.service;

import com.qs.groupmatcher.dto.UserResponse;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> findByRole(Role role) {
        return userRepository.findByRoleOrderByNameAsc(role).stream()
                .map(UserResponse::from)
                .toList();
    }
}
