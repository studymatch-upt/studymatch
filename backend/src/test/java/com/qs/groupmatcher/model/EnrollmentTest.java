package com.qs.groupmatcher.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.qs.groupmatcher.service.profile.Competency;
import java.math.BigDecimal;
import java.util.Map;
import org.junit.jupiter.api.Test;

class EnrollmentTest {

    private final User student = new User("Carla", "carla@test", Role.STUDENT);
    private final CourseUnit unit = new CourseUnit("AM", "Análise", 1, 1, Map.of(Competency.MATHEMATICS_AND_LOGIC, 1.0));

    @Test
    void acceptsBoundaryGradesAndKeepsTwoDecimals() {
        assertThat(new Enrollment(student, unit, 2024, 1, new BigDecimal("0")).getGrade()).isEqualByComparingTo("0.00");
        assertThat(new Enrollment(student, unit, 2024, 1, new BigDecimal("20")).getGrade()).isEqualByComparingTo("20.00");
        assertThat(new Enrollment(student, unit, 2024, 1, new BigDecimal("14.5")).getGrade().scale()).isEqualTo(2);
    }

    @Test
    void rejectsGradesOutsideZeroToTwenty() {
        assertThatThrownBy(() -> new Enrollment(student, unit, 2024, 1, new BigDecimal("-0.01")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Enrollment(student, unit, 2024, 1, new BigDecimal("20.01")))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Enrollment(student, unit, 2024, 1, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsAttemptBelowOne() {
        assertThatThrownBy(() -> new Enrollment(student, unit, 2024, 0, new BigDecimal("10")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void changeGradeIsValidatedToo() {
        Enrollment enrollment = new Enrollment(student, unit, 2024, 1, new BigDecimal("10"));
        enrollment.changeGrade(new BigDecimal("18"));
        assertThat(enrollment.getGrade()).isEqualByComparingTo("18");
        assertThatThrownBy(() -> enrollment.changeGrade(new BigDecimal("21")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
