package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.service.profile.Competency;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

/**
 * Body of PUT /api/students/{id}/questionnaire: one answer from 1 to 5 per competency.
 * Replaces all previous answers; answering only some competencies is allowed.
 */
public record QuestionnaireRequest(
        @NotEmpty(message = "Give at least one answer")
        Map<Competency, @NotNull @Min(1) @Max(5) Integer> answers) {
}
