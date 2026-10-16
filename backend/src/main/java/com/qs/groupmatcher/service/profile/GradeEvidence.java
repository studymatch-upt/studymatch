package com.qs.groupmatcher.service.profile;

import java.util.EnumMap;
import java.util.Map;
import java.util.Objects;

/**
 * One academic result: the grade a student obtained in a course unit, together with how much
 * that course unit contributes to each competency.
 *
 * @param courseUnitCode identifies the course unit (e.g. "AED")
 * @param attempt        1 for the first attempt, 2 for the second... only the latest one counts
 * @param grade          final grade on the Portuguese 0-20 scale
 * @param weights        contribution of the course unit to each competency, each in ]0, 1]
 *                       (e.g. AED: PROGRAMMING 0.7, MATHEMATICS_AND_LOGIC 0.3)
 */
public record GradeEvidence(String courseUnitCode, int attempt, double grade, Map<Competency, Double> weights) {

    public static final double MIN_GRADE = 0;
    public static final double MAX_GRADE = 20;

    public GradeEvidence {
        if (courseUnitCode == null || courseUnitCode.isBlank()) {
            throw new IllegalArgumentException("courseUnitCode must not be blank");
        }
        if (attempt < 1) {
            throw new IllegalArgumentException("attempt must be at least 1, was " + attempt);
        }
        if (grade < MIN_GRADE || grade > MAX_GRADE) {
            throw new IllegalArgumentException("grade must be between 0 and 20, was " + grade);
        }
        Objects.requireNonNull(weights, "weights must not be null");
        if (weights.isEmpty()) {
            throw new IllegalArgumentException("course unit " + courseUnitCode + " must contribute to at least one competency");
        }
        weights.forEach((competency, weight) -> {
            Objects.requireNonNull(competency, "competency must not be null");
            if (weight == null || weight <= 0 || weight > 1) {
                throw new IllegalArgumentException("weight of " + competency + " must be in ]0, 1], was " + weight);
            }
        });
        weights = Map.copyOf(new EnumMap<>(weights));
    }
}