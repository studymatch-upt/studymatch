package com.qs.groupmatcher.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qs.groupmatcher.dto.StudentRequest;
import com.qs.groupmatcher.dto.StudentResponse;
import com.qs.groupmatcher.exception.BusinessRuleException;
import com.qs.groupmatcher.exception.DuplicateResourceException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private UserRepository userRepository;

    private StudentService service;

    @BeforeEach
    void setUp() {
        service = new StudentService(userRepository);
    }

    private static StudentRequest request() {
        return new StudentRequest("  Rui Silva ", " Rui@School.test ", " 12345 ", 2);
    }

    @Test
    void createsStudentWithNormalizedData() {
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentResponse result = service.create(request());

        assertThat(result.name()).isEqualTo("Rui Silva");
        assertThat(result.email()).isEqualTo("rui@school.test");
        assertThat(result.studentNumber()).isEqualTo("12345");
        assertThat(result.curricularYear()).isEqualTo(2);
    }

    @Test
    void rejectsDuplicateEmailOnCreate() {
        when(userRepository.existsByEmail("rui@school.test")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("rui@school.test");
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsDuplicateStudentNumberOnCreate() {
        when(userRepository.existsByStudentNumber("12345")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request()))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("12345");
        verify(userRepository, never()).save(any());
    }

    @Test
    void updatesAnExistingStudent() {
        User student = User.student("Old Name", "old@school.test", "111", 1);
        when(userRepository.findByIdAndRole(7L, Role.STUDENT)).thenReturn(Optional.of(student));

        StudentResponse result = service.update(7L, request());

        assertThat(student.getName()).isEqualTo("Rui Silva");
        assertThat(student.getEmail()).isEqualTo("rui@school.test");
        assertThat(student.getStudentNumber()).isEqualTo("12345");
        assertThat(student.getCurricularYear()).isEqualTo(2);
        assertThat(result.name()).isEqualTo("Rui Silva");
    }

    @Test
    void rejectsEmailUsedByAnotherUserOnUpdate() {
        User student = User.student("Old Name", "old@school.test", "111", 1);
        when(userRepository.findByIdAndRole(7L, Role.STUDENT)).thenReturn(Optional.of(student));
        when(userRepository.existsByEmailAndIdNot("rui@school.test", 7L)).thenReturn(true);

        assertThatThrownBy(() -> service.update(7L, request()))
                .isInstanceOf(DuplicateResourceException.class);
        assertThat(student.getName()).isEqualTo("Old Name");
    }

    @Test
    void updateOfUnknownStudentOrOfATeacherIsNotFound() {
        when(userRepository.findByIdAndRole(99L, Role.STUDENT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(99L, request()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getOfUnknownStudentIsNotFound() {
        when(userRepository.findByIdAndRole(99L, Role.STUDENT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listNormalizesFiltersAndAppliesSortDirection() {
        User student = User.student("Ana", "ana@school.test", "1", 2);
        when(userRepository.searchStudents(eq(Role.STUDENT), eq("ana"), eq(2), any(Sort.class)))
                .thenReturn(List.of(student));

        List<StudentResponse> result = service.list("  ANA ", 2, "name", "desc");

        assertThat(result).extracting(StudentResponse::name).containsExactly("Ana");
        ArgumentCaptor<Sort> sort = ArgumentCaptor.forClass(Sort.class);
        verify(userRepository).searchStudents(eq(Role.STUDENT), eq("ana"), eq(2), sort.capture());
        assertThat(sort.getValue().getOrderFor("name").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void listWithoutFiltersUsesNeutralValues() {
        when(userRepository.searchStudents(eq(Role.STUDENT), eq(""), eq(0), any(Sort.class)))
                .thenReturn(List.of());

        assertThat(service.list(null, null, "name", "asc")).isEmpty();
    }

    @Test
    void listRejectsUnknownSortField() {
        assertThatThrownBy(() -> service.list(null, null, "password", "asc"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cannot sort by");
    }

    @Test
    void listRejectsBadDirection() {
        assertThatThrownBy(() -> service.list(null, null, "name", "sideways"))
                .isInstanceOf(BusinessRuleException.class);
    }

    @Test
    void listRejectsNonPositiveYear() {
        assertThatThrownBy(() -> service.list(null, 0, "name", "asc"))
                .isInstanceOf(BusinessRuleException.class);
    }
}
