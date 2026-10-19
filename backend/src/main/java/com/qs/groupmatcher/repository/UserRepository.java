package com.qs.groupmatcher.repository;

import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRoleOrderByNameAsc(Role role);

    Optional<User> findByIdAndRole(Long id, Role role);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByStudentNumber(String studentNumber);

    boolean existsByStudentNumberAndIdNot(String studentNumber, Long id);

    /**
     * Students filtered by free text (name, email or student number) and curricular year.
     * Pass {@code search = ""} and {@code year = 0} for "no filter"; {@code search} must be lower case.
     */
    @Query("""
            select u from User u
            where u.role = :role
              and (:search = ''
                   or lower(u.name) like concat('%', :search, '%')
                   or lower(u.email) like concat('%', :search, '%')
                   or lower(u.studentNumber) like concat('%', :search, '%'))
              and (:year = 0 or u.curricularYear = :year)
            """)
    List<User> searchStudents(
            @Param("role") Role role,
            @Param("search") String search,
            @Param("year") int year,
            Sort sort);
}
