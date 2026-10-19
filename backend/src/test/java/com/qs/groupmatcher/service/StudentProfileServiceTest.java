package com.qs.groupmatcher.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.Mockito.when;

import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.model.Enrollment;
import com.qs.groupmatcher.model.QuestionnaireAnswer;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.EnrollmentRepository;
import com.qs.groupmatcher.repository.QuestionnaireAnswerRepository;
import com.qs.groupmatcher.service.profile.Competency;
import com.qs.groupmatcher.service.profile.ProfileCalculator;
import com.qs.groupmatcher.service.profile.StudentProfile;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Real ProfileCalculator, mocked persistence: checks the mapping from stored data to evidence. */
@ExtendWith(MockitoExtension.class)
class StudentProfileServiceTest {

    private static final long STUDENT_ID = 5L;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private QuestionnaireAnswerRepository answerRepository;

    @Mock
    private StudentLookup studentLookup;

    private StudentProfileService service;

    private final User student = new User("Carla", "carla@test", Role.STUDENT);
    private final CourseUnit am = new CourseUnit("AM", "Análise", 1, 1, Map.of(Competency.MATHEMATICS_AND_LOGIC, 1.0));
    private final CourseUnit aed = new CourseUnit("AED", "Algoritmos", 1, 1,
            Map.of(Competency.PROGRAMMING, 0.7, Competency.MATHEMATICS_AND_LOGIC, 0.3));
    private final CourseUnit bd = new CourseUnit("BD", "Bases de Dados", 1, 2,
            Map.of(Competency.DATABASES, 0.8, Competency.PROGRAMMING, 0.2));

    @BeforeEach
    void createService() {
        service = new StudentProfileService(enrollmentRepository, answerRepository, studentLookup,
                new ProfileCalculator());
    }

    private Enrollment result(CourseUnit unit, int year, int attempt, String grade) {
        return new Enrollment(student, unit, year, attempt, new BigDecimal(grade));
    }

    @Test
    void carlaScenarioUsesOnlyTheLatestAttemptOfRepeatedUnits() {
        when(enrollmentRepository.findWithCourseUnitByStudentId(STUDENT_ID)).thenReturn(List.of(
                result(am, 2024, 1, "14"),
                result(aed, 2024, 1, "8"),
                result(aed, 2025, 2, "16"),
                result(bd, 2024, 1, "17")));
        when(answerRepository.findByStudentId(STUDENT_ID)).thenReturn(Arrays.stream(Competency.values())
                .map(c -> new QuestionnaireAnswer(student, c, 3)).toList());

        StudentProfile profile = service.profileOf(STUDENT_ID);

        assertThat(profile.completedCourseUnits()).isEqualTo(3);
        assertThat(profile.questionnaireWeight()).isCloseTo(0.7, within(1e-9));
        // alpha 0.7, Q = 50 everywhere
        assertThat(profile.scoreOf(Competency.PROGRAMMING).getAsDouble()).isCloseTo(59.33, within(0.01));
        assertThat(profile.scoreOf(Competency.MATHEMATICS_AND_LOGIC).getAsDouble()).isCloseTo(56.69, within(0.01));
        assertThat(profile.scoreOf(Competency.DATABASES).getAsDouble()).isCloseTo(60.5, within(0.01));
        assertThat(profile.scoreOf(Competency.COMMUNICATION).getAsDouble()).isCloseTo(50.0, within(0.01));
    }

    @Test
    void coldStartProfileEqualsTheQuestionnaire() {
        when(enrollmentRepository.findWithCourseUnitByStudentId(STUDENT_ID)).thenReturn(List.of());
        when(answerRepository.findByStudentId(STUDENT_ID))
                .thenReturn(List.of(new QuestionnaireAnswer(student, Competency.PROGRAMMING, 4)));

        StudentProfile profile = service.profileOf(STUDENT_ID);

        assertThat(profile.questionnaireWeight()).isEqualTo(1.0);
        assertThat(profile.scoreOf(Competency.PROGRAMMING).getAsDouble()).isCloseTo(75.0, within(0.01));
        assertThat(profile.isKnown(Competency.DATABASES)).isFalse();
    }

    @Test
    void unknownStudentIsRejected() {
        when(studentLookup.requireStudent(99L)).thenThrow(new ResourceNotFoundException("Student", 99L));

        assertThatThrownBy(() -> service.profileOf(99L)).isInstanceOf(ResourceNotFoundException.class);
    }
}
