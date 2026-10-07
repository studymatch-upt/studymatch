package com.qs.groupmatcher.controller;

import com.qs.groupmatcher.dto.UserResponse;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.service.UserService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listByRole(@RequestParam Role role) {
        return userService.findByRole(role);
    }
}
