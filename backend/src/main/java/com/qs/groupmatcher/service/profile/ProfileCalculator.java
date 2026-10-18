package com.qs.groupmatcher.service.profile;

import java.util.Collection;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Builds a student's competency profile from two sources:
 *
 * <ul>
 *   <li><b>Cold start</b> — the onboarding questionnaire (one answer from 1 to 5 per competency);</li>
 *   <li><b>Academic history</b> — grades in course units, each contributing to some competencies.</li>
 * </ul>
 *
 * <p>The questionnaire weighs everything at the start and gives way to academic evidence as the
 * student completes course units, but never drops below {@value #MIN_QUESTIONNAIRE_WEIGHT}:
 *
 * <pre>
 *   Q(c)     = (answer − 1) / 4 × 100
 *   G(c)     = Σ (grade / 20 × 100 × weight) / Σ weight      (latest attempt of each course unit)
 *   α        = max(0.2, 1 − 0.1 × completed course units)
 *   Score(c) = α × Q(c) + (1 − α) × G(c)
 * </pre>
 *
 * <p>When only one source exists for a competency, that source is used alone. When neither exists,
 * the competency is unknown.
 *
 * <p>Pure business logic: no database and no web layer, so it can be unit tested in isolation.
 */
@Component
public class ProfileCalculator {

    public static final int MIN_ANSWER = 1;
    public static final int MAX_ANSWER = 5;
    public static final double MIN_QUESTIONNAIRE_WEIGHT = 0.2;
    public static final double WEIGHT_LOST_PER_COURSE_UNIT = 0.1;

    /**
     * @param questionnaireAnswers answer from 1 to 5 per competency; may be empty or partial
     * @param grades               academic results; may be empty; several attempts of the same
     *                             course unit are allowed and only the latest one counts
     * @return the student's profile
     * @throws IllegalArgumentException if an answer is outside 1-5
     */
    public StudentProfile calculate(Map<Competency, Integer> questionnaireAnswers, Collection<GradeEvidence> grades) {
        Objects.requireNonNull(questionnaireAnswers, "questionnaireAnswers must not be null");
        Objects.requireNonNull(grades, "grades must not be null");

        Map<Competency, Double> questionnaireScores = questionnaireScores(questionnaireAnswers);
        List<GradeEvidence> latestGrades = latestAttempts(grades);
        Map<Competency, Double> academicScores = academicScores(latestGrades);
        double alpha = questionnaireWeight(latestGrades.size());

        Map<Competency, Double> scores = new EnumMap<>(Competency.class);
        for (Competency competency : Competency.values()) {
            Double q = questionnaireScores.get(competency);
            Double g = academicScores.get(competency);
            if (q != null && g != null) {
                scores.put(competency, alpha * q + (1 - alpha) * g);
            } else if (q != null) {
                scores.put(competency, q);
            } else if (g != null) {
                scores.put(competency, g);
            }
            // neither source: the competency stays unknown
        }
        return new StudentProfile(scores, alpha, latestGrades.size());
    }

    /** α = max(0.2, 1 − 0.1 × completed course units). */
    double questionnaireWeight(int completedCourseUnits) {
        return Math.max(MIN_QUESTIONNAIRE_WEIGHT, 1 - WEIGHT_LOST_PER_COURSE_UNIT * completedCourseUnits);
    }

    private Map<Competency, Double> questionnaireScores(Map<Competency, Integer> answers) {
        Map<Competency, Double> scores = new EnumMap<>(Competency.class);
        answers.forEach((competency, answer) -> {
            Objects.requireNonNull(competency, "competency must not be null");
            if (answer == null || answer < MIN_ANSWER || answer > MAX_ANSWER) {
                throw new IllegalArgumentException(
                    "answer for " + competency + " must be between 1 and 5, was " + answer);
            }
            scores.put(competency, (answer - MIN_ANSWER) / (double) (MAX_ANSWER - MIN_ANSWER) * 100);
        });
        return scores;
    }

    /** Keeps, for each course unit, only the attempt with the highest number. */
    private List<GradeEvidence> latestAttempts(Collection<GradeEvidence> grades) {
        return List.copyOf(grades.stream()
            .collect(Collectors.toMap(
                GradeEvidence::courseUnitCode,
                evidence -> evidence,
                (a, b) -> a.attempt() >= b.attempt() ? a : b))
            .values()
            .stream()
            .sorted(Comparator.comparing(GradeEvidence::courseUnitCode))
            .toList());
    }

    private Map<Competency, Double> academicScores(List<GradeEvidence> grades) {
        Map<Competency, Double> weightedSum = new EnumMap<>(Competency.class);
        Map<Competency, Double> totalWeight = new EnumMap<>(Competency.class);
        for (GradeEvidence evidence : grades) {
            double gradeAsPercentage = evidence.grade() / GradeEvidence.MAX_GRADE * 100;
            evidence.weights().forEach((competency, weight) -> {
                weightedSum.merge(competency, gradeAsPercentage * weight, Double::sum);
                totalWeight.merge(competency, weight, Double::sum);
            });
        }
        Map<Competency, Double> scores = new EnumMap<>(Competency.class);
        weightedSum.forEach((competency, sum) -> scores.put(competency, sum / totalWeight.get(competency)));
        return scores;
    }
}