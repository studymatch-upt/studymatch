package com.qs.groupmatcher.service;

import com.qs.groupmatcher.dto.StudentRequest;
import com.qs.groupmatcher.dto.StudentResponse;
import com.qs.groupmatcher.exception.BusinessRuleException;
import com.qs.groupmatcher.exception.DuplicateResourceException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.UserRepository;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class StudentService {

    /** Entity attribute names a client may sort by. Anything else is rejected. */
    private static final Set<String> SORTABLE_FIELDS = Set.of("name", "email", "studentNumber", "curricularYear");

    private final UserRepository userRepository;

    public StudentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        String email = normalizeEmail(request.email());
        String studentNumber = request.studentNumber().strip();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user with email " + email + " already exists");
        }
        if (userRepository.existsByStudentNumber(studentNumber)) {
            throw new DuplicateResourceException("Student number " + studentNumber + " is already in use");
        }

        User student = User.student(request.name().strip(), email, studentNumber, request.curricularYear());
        return StudentResponse.from(userRepository.save(student));
    }

    public List<StudentResponse> list(String search, Integer curricularYear, String sortBy, String direction) {
        if (curricularYear != null && curricularYear < 1) {
            throw new BusinessRuleException("curricularYear must be at least 1");
        }
        String term = search == null ? "" : search.strip().toLowerCase(Locale.ROOT);
        int year = curricularYear == null ? 0 : curricularYear;

        return userRepository.searchStudents(Role.STUDENT, term, year, sortOf(sortBy, direction)).stream()
                .map(StudentResponse::from)
                .toList();
    }

    public StudentResponse get(Long id) {
        return StudentResponse.from(findStudent(id));
    }

    @Transactional
    public StudentResponse update(Long id, StudentRequest request) {
        User student = findStudent(id);
        String email = normalizeEmail(request.email());
        String studentNumber = request.studentNumber().strip();

        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new DuplicateResourceException("A user with email " + email + " already exists");
        }
        if (userRepository.existsByStudentNumberAndIdNot(studentNumber, id)) {
            throw new DuplicateResourceException("Student number " + studentNumber + " is already in use");
        }

        student.updateStudent(request.name().strip(), email, studentNumber, request.curricularYear());
        return StudentResponse.from(student);
    }

    /** A teacher's id counts as "not found" here, so this endpoint can never edit a teacher. */
    private User findStudent(Long id) {
        return userRepository.findByIdAndRole(id, Role.STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Student", id));
    }

    private static String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private static Sort sortOf(String sortBy, String direction) {
        if (!SORTABLE_FIELDS.contains(sortBy)) {
            throw new BusinessRuleException("Cannot sort by '" + sortBy + "'. Use one of: " + SORTABLE_FIELDS);
        }
        Sort.Direction sortDirection = switch (direction.toLowerCase(Locale.ROOT)) {
            case "asc" -> Sort.Direction.ASC;
            case "desc" -> Sort.Direction.DESC;
            default -> throw new BusinessRuleException("direction must be 'asc' or 'desc'");
        };
        // id as a tiebreaker keeps the order stable when many students share a year.
        return Sort.by(sortDirection, sortBy).and(Sort.by(Sort.Direction.ASC, "id"));
    }
}
