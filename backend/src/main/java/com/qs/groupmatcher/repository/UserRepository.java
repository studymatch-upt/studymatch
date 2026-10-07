package com.qs.groupmatcher.repository;

import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRoleOrderByNameAsc(Role role);
}
