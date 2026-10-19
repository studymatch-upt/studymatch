package com.qs.groupmatcher.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qs.groupmatcher.dto.EnrollmentRequest;
import com.qs.groupmatcher.dto.EnrollmentResponse;
import com.qs.groupmatcher.dto.GradeUpdateRequest;
import com.qs.groupmatcher.exception.DuplicateResourceException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.model.Enrollment;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import com.qs.groupmatcher.repository.EnrollmentRepository;
import com.qs.groupmatcher.service.profile.Competency;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    private static final long STUDENT_ID = 5L;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseUnitRepository courseUnitRepository;

    @Mock
    private StudentLookup studentLookup;

    @InjectMocks
    private EnrollmentService service;

    private final User student = new User("Carla", "carla@test", Role.STUDENT);
    private final CourseUnit aed = new CourseUnit("AED", "Algoritmos", 1, 1,
            Map.of(Competency.PROGRAMMING, 0.7, Competency.MATHEMATICS_AND_LOGIC, 0.3));

    @BeforeEach
    void assignIds() {
        ReflectionTestUtils.setField(student, "id", STUDENT_ID);
        ReflectionTestUtils.setField(aed, "id", 7L);
    }

    private static EnrollmentRequest request(String code, int attempt, String grade) {
        return new EnrollmentRequest(code, 2024, attempt, new BigDecimal(grade));
    }

    @Test
    void addStoresTheResultAndFormatsTheAcademicYear() {
        when(studentLookup.requireStudent(STUDENT_ID)).thenReturn(student);
        when(courseUnitRepository.findByCode("AED")).thenReturn(Optional.of(aed));
        when(enrollmentRepository.existsByStudentIdAndCourseUnitIdAndAttempt(STUDENT_ID, 7L, 1)).thenReturn(false);
        when(enrollmentRepository.save(any(Enrollment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EnrollmentResponse response = service.add(STUDENT_ID, request(" aed", 1, "14.5"));

        assertThat(response.courseUnitCode()).isEqualTo("AED");
        assertThat(response.academicYearLabel()).isEqualTo("2024/25");
        assertThat(response.attempt()).isEqualTo(1);
        assertThat(response.grade()).isEqualByComparingTo("14.5");
    }

    @Test
    void addRejectsTheSameAttemptTwice() {
        when(studentLookup.requireStudent(STUDENT_ID)).thenReturn(student);
        when(courseUnitRepository.findByCode("AED")).thenReturn(Optional.of(aed));
        when(enrollmentRepository.existsByStudentIdAndCourseUnitIdAndAttempt(STUDENT_ID, 7L, 1)).thenReturn(true);

        assertThatThrownBy(() -> service.add(STUDENT_ID, request("AED", 1, "10")))
                .isInstanceOf(DuplicateResourceException.class);
        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void addRejectsAnUnknownCourseUnit() {
        when(studentLookup.requireStudent(STUDENT_ID)).thenReturn(student);
        when(courseUnitRepository.findByCode("NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.add(STUDENT_ID, request("nope", 1, "10")))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void addRejectsAnUnknownStudent() {
        when(studentLookup.requireStudent(99L)).thenThrow(new ResourceNotFoundException("Student", 99L));

        assertThatThrownBy(() -> service.add(99L, request("AED", 1, "10")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateGradeChangesOnlyTheGrade() {
        Enrollment enrollment = new Enrollment(student, aed, 2024, 1, new BigDecimal("8"));
        ReflectionTestUtils.setField(enrollment, "id", 3L);
        when(enrollmentRepository.findByIdAndStudentId(3L, STUDENT_ID)).thenReturn(Optional.of(enrollment));

        EnrollmentResponse response = service.updateGrade(STUDENT_ID, 3L, new GradeUpdateRequest(new BigDecimal("16.5")));

        assertThat(response.grade()).isEqualByComparingTo("16.5");
        assertThat(response.attempt()).isEqualTo(1);
    }

    @Test
    void anEnrollmentOfAnotherStudentIsNotFound() {
        when(enrollmentRepository.findByIdAndStudentId(3L, STUDENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateGrade(STUDENT_ID, 3L, new GradeUpdateRequest(BigDecimal.TEN)))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> service.delete(STUDENT_ID, 3L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(enrollmentRepository, never()).delete(any(Enrollment.class));
    }

    @Test
    void deleteRemovesTheEnrollment() {
        Enrollment enrollment = new Enrollment(student, aed, 2024, 1, new BigDecimal("8"));
        when(enrollmentRepository.findByIdAndStudentId(3L, STUDENT_ID)).thenReturn(Optional.of(enrollment));

        service.delete(STUDENT_ID, 3L);

        verify(enrollmentRepository).delete(enrollment);
    }
}
