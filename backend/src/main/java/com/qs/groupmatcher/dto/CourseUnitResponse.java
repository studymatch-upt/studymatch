package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.service.profile.Competency;
import java.util.EnumMap;
import java.util.Map;

public record CourseUnitResponse(
        Long id,
        String code,
        String name,
        int curricularYear,
        int semester,
        Map<Competency, Double> competencyWeights) {

    public static CourseUnitResponse from(CourseUnit unit) {
        Map<Competency, Double> weights = new EnumMap<>(Competency.class);
        weights.putAll(unit.getCompetencyWeights());
        return new CourseUnitResponse(unit.getId(), unit.getCode(), unit.getName(),
                unit.getCurricularYear(), unit.getSemester(), weights);
    }
}
