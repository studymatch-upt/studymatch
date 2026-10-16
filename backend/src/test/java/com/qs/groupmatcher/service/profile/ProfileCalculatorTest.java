package com.qs.groupmatcher.service.profile;

import static com.qs.groupmatcher.service.profile.Competency.COMMUNICATION;
import static com.qs.groupmatcher.service.profile.Competency.DATABASES;
import static com.qs.groupmatcher.service.profile.Competency.MATHEMATICS_AND_LOGIC;
import static com.qs.groupmatcher.service.profile.Competency.PROGRAMMING;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

class ProfileCalculatorTest {

    private static final Offset<Double> PRECISION = within(0.01);

    private final ProfileCalculator calculator = new ProfileCalculator();

    /** AED: 70% Programming, 30% Mathematics and Logic. */
    private static GradeEvidence aed(double grade) {
        return new GradeEvidence("AED", 1, grade, Map.of(PROGRAMMING, 0.7, MATHEMATICS_AND_LOGIC, 0.3));
    }

    /** Mobile Applications Lab: 60% Programming, 40% Databases. */
    private static GradeEvidence mobileLab(double grade) {
        return new GradeEvidence("LAM", 1, grade, Map.of(PROGRAMMING, 0.6, DATABASES, 0.4));
    }

    /** n different course units, all with the given grade, all contributing only to Programming. */
    private static List<GradeEvidence> programmingCourseUnits(int n, double grade) {
        List<GradeEvidence> grades = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            grades.add(new GradeEvidence("UC" + i, 1, grade, Map.of(PROGRAMMING, 1.0)));
        }
        return grades;
    }

    @Nested
    @DisplayName("Normal scenario")
    class NormalScenario {

        @Test
        @DisplayName("combines questionnaire and grades using α")
        void combinesQuestionnaireAndGrades() {
            // Questionnaire: Programming 3 -> Q = 50
            // Grades: AED 16 (80%, w 0.7) + LAM 14 (70%, w 0.6) -> G = (56 + 42) / 1.3 = 75.38
            // 2 course units -> α = 0.8 -> 0.8 × 50 + 0.2 × 75.38 = 55.08
            StudentProfile profile = calculator.calculate(Map.of(PROGRAMMING, 3), List.of(aed(16), mobileLab(14)));

            assertThat(profile.completedCourseUnits()).isEqualTo(2);
            assertThat(profile.questionnaireWeight()).isCloseTo(0.8, PRECISION);
            assertThat(profile.scoreOf(PROGRAMMING).getAsDouble()).isCloseTo(55.08, PRECISION);
        }

        @Test
        @DisplayName("a competency with only academic evidence uses the grades alone")
        void competencyWithOnlyGradesUsesGrades() {
            StudentProfile profile = calculator.calculate(Map.of(PROGRAMMING, 3), List.of(aed(16)));

            // Mathematics was not answered in the questionnaire, but AED contributes to it: 16/20 = 80
            assertThat(profile.scoreOf(MATHEMATICS_AND_LOGIC).getAsDouble()).isCloseTo(80.0, PRECISION);
        }
    }

    @Nested
    @DisplayName("Student profile rules")
    class ProfileRules {

        @Test
        @DisplayName("only the latest attempt of a course unit counts")
        void onlyLatestAttemptCounts() {
            GradeEvidence failed = new GradeEvidence("AED", 1, 6, Map.of(PROGRAMMING, 1.0));
            GradeEvidence improved = new GradeEvidence("AED", 2, 18, Map.of(PROGRAMMING, 1.0));

            StudentProfile profile = calculator.calculate(Map.of(), List.of(improved, failed));

            assertThat(profile.completedCourseUnits()).isEqualTo(1);
            assertThat(profile.scoreOf(PROGRAMMING).getAsDouble()).isCloseTo(90.0, PRECISION);
        }

        @Test
        @DisplayName("the profile changes when a new grade is added")
        void profileIsUpdatedWithNewGrades() {
            StudentProfile before = calculator.calculate(Map.of(PROGRAMMING, 3), List.of(aed(10)));
            StudentProfile after = calculator.calculate(Map.of(PROGRAMMING, 3), List.of(aed(10), mobileLab(20)));

            assertThat(after.scoreOf(PROGRAMMING).getAsDouble())
                .isGreaterThan(before.scoreOf(PROGRAMMING).getAsDouble());
            assertThat(after.questionnaireWeight()).isLessThan(before.questionnaireWeight());
        }

        @Test
        @DisplayName("a competency without questionnaire answer or grades is unknown")
        void competencyWithoutDataIsUnknown() {
            StudentProfile profile = calculator.calculate(Map.of(PROGRAMMING, 4), List.of());

            assertThat(profile.isKnown(COMMUNICATION)).isFalse();
            assertThat(profile.scoreOf(COMMUNICATION)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Cold-start rules")
    class ColdStartRules {

        @Test
        @DisplayName("a student without grades gets a profile from the questionnaire only")
        void noGradesMeansQuestionnaireOnly() {
            StudentProfile profile = calculator.calculate(
                Map.of(PROGRAMMING, 5, MATHEMATICS_AND_LOGIC, 1, COMMUNICATION, 4), List.of());

            assertThat(profile.questionnaireWeight()).isEqualTo(1.0);
            assertThat(profile.completedCourseUnits()).isZero();
            assertThat(profile.scoreOf(PROGRAMMING).getAsDouble()).isCloseTo(100.0, PRECISION);
            assertThat(profile.scoreOf(MATHEMATICS_AND_LOGIC).getAsDouble()).isCloseTo(0.0, PRECISION);
            assertThat(profile.scoreOf(COMMUNICATION).getAsDouble()).isCloseTo(75.0, PRECISION);
        }

        @ParameterizedTest(name = "{0} course units -> α = {1}")
        @CsvSource({"0, 1.0", "1, 0.9", "4, 0.6", "7, 0.3"})
        @DisplayName("the questionnaire loses 10% of its weight per completed course unit")
        void questionnaireWeightDecreasesWithEvidence(int courseUnits, double expectedAlpha) {
            StudentProfile profile = calculator.calculate(
                Map.of(PROGRAMMING, 3), programmingCourseUnits(courseUnits, 20));

            assertThat(profile.questionnaireWeight()).isCloseTo(expectedAlpha, PRECISION);
        }

        @Test
        @DisplayName("a student with no data at all has an empty profile")
        void noDataAtAllMeansEverythingUnknown() {
            StudentProfile profile = calculator.calculate(Map.of(), List.of());

            assertThat(profile.scores()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Boundary conditions")
    class BoundaryConditions {

        @ParameterizedTest(name = "{0} course units -> α stays at 0.2")
        @ValueSource(ints = {8, 9, 20})
        @DisplayName("the questionnaire never weighs less than 20%")
        void questionnaireWeightNeverBelowMinimum(int courseUnits) {
            StudentProfile profile = calculator.calculate(
                Map.of(PROGRAMMING, 3), programmingCourseUnits(courseUnits, 20));

            assertThat(profile.questionnaireWeight()).isCloseTo(0.2, PRECISION);
        }

        @ParameterizedTest(name = "answer {0} -> score {1}")
        @CsvSource({"1, 0", "3, 50", "5, 100"})
        @DisplayName("questionnaire answers at the limits of the scale")
        void answersAtScaleLimits(int answer, double expectedScore) {
            StudentProfile profile = calculator.calculate(Map.of(PROGRAMMING, answer), List.of());

            assertThat(profile.scoreOf(PROGRAMMING).getAsDouble()).isCloseTo(expectedScore, PRECISION);
        }

        @ParameterizedTest(name = "grade {0} -> score {1}")
        @CsvSource({"0, 0", "20, 100"})
        @DisplayName("grades at the limits of the 0-20 scale are accepted")
        void gradesAtScaleLimits(double grade, double expectedScore) {
            GradeEvidence evidence = new GradeEvidence("AED", 1, grade, Map.of(PROGRAMMING, 1.0));

            StudentProfile profile = calculator.calculate(Map.of(), List.of(evidence));

            assertThat(profile.scoreOf(PROGRAMMING).getAsDouble()).isCloseTo(expectedScore, PRECISION);
        }
    }

    @Nested
    @DisplayName("Invalid input")
    class InvalidInput {

        @ParameterizedTest(name = "answer {0} is rejected")
        @ValueSource(ints = {0, 6, -1})
        void answerOutsideScaleIsRejected(int answer) {
            assertThatThrownBy(() -> calculator.calculate(Map.of(PROGRAMMING, answer), List.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 1 and 5");
        }

        @ParameterizedTest(name = "grade {0} is rejected")
        @ValueSource(doubles = {-1, 20.5, 25})
        void gradeOutsideScaleIsRejected(double grade) {
            assertThatThrownBy(() -> new GradeEvidence("AED", 1, grade, Map.of(PROGRAMMING, 1.0)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 0 and 20");
        }

        @Test
        void courseUnitWithoutCompetenciesIsRejected() {
            assertThatThrownBy(() -> new GradeEvidence("AED", 1, 15, Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
        }

        @ParameterizedTest(name = "weight {0} is rejected")
        @ValueSource(doubles = {0, -0.5, 1.5})
        void invalidWeightIsRejected(double weight) {
            assertThatThrownBy(() -> new GradeEvidence("AED", 1, 15, Map.of(PROGRAMMING, weight)))
                .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void attemptBelowOneIsRejected() {
            assertThatThrownBy(() -> new GradeEvidence("AED", 0, 15, Map.of(PROGRAMMING, 1.0)))
                .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void nullInputIsRejected() {
            assertThatThrownBy(() -> calculator.calculate(null, List.of()))
                .isInstanceOf(NullPointerException.class);
        }
    }
}