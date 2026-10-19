package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.service.profile.Competency;
import com.qs.groupmatcher.service.profile.StudentProfile;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * A student's profile as shown to the client.
 *
 * @param scores               0-100 per competency; unknown competencies are not in the map
 * @param unknownCompetencies  competencies with neither a questionnaire answer nor academic evidence
 * @param questionnaireWeight  share of the profile that comes from the questionnaire (alpha)
 * @param academicWeight       share that comes from grades (1 - alpha)
 * @param completedCourseUnits course units with a grade (latest attempt only)
 */
public record ProfileResponse(
        Long studentId,
        Map<Competency, Double> scores,
        List<Competency> unknownCompetencies,
        double questionnaireWeight,
        double academicWeight,
        int completedCourseUnits) {

    public static ProfileResponse from(Long studentId, StudentProfile profile) {
        Map<Competency, Double> scores = new EnumMap<>(Competency.class);
        List<Competency> unknown = new ArrayList<>();
        for (Competency competency : Competency.values()) {
            if (profile.isKnown(competency)) {
                scores.put(competency, round(profile.scoreOf(competency).getAsDouble()));
            } else {
                unknown.add(competency);
            }
        }
        return new ProfileResponse(studentId, scores, unknown,
                round(profile.questionnaireWeight()), round(profile.academicWeight()),
                profile.completedCourseUnits());
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
