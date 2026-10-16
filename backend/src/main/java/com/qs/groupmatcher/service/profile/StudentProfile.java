package com.qs.groupmatcher.service.profile;

import java.util.EnumMap;
import java.util.Map;
import java.util.OptionalDouble;

/**
 * The result of a profile calculation.
 *
 * @param scores                score from 0 to 100 per competency; a competency that is absent is
 *                              <em>unknown</em> (no questionnaire answer and no academic evidence)
 * @param questionnaireWeight   α: how much the questionnaire counts, from 1.0 (only questionnaire)
 *                              down to 0.2; shown to the user as a confidence indicator
 * @param completedCourseUnits  number of distinct course units with a grade
 */
public record StudentProfile(Map<Competency, Double> scores, double questionnaireWeight, int completedCourseUnits) {

    public StudentProfile {
        scores = Map.copyOf(new EnumMap<>(scores));
    }

    /** The score of a competency, or empty when it is unknown. */
    public OptionalDouble scoreOf(Competency competency) {
        Double score = scores.get(competency);
        return score == null ? OptionalDouble.empty() : OptionalDouble.of(score);
    }

    public boolean isKnown(Competency competency) {
        return scores.containsKey(competency);
    }

    /** Share of the profile that comes from academic evidence: 1 − α. */
    public double academicWeight() {
        return 1 - questionnaireWeight;
    }
}