package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.service.profile.Competency;
import java.util.EnumMap;
import java.util.Map;

public record QuestionnaireResponse(Map<Competency, Integer> answers) {

    public static QuestionnaireResponse of(Map<Competency, Integer> answers) {
        Map<Competency, Integer> ordered = new EnumMap<>(Competency.class);
        ordered.putAll(answers);
        return new QuestionnaireResponse(ordered);
    }
}
