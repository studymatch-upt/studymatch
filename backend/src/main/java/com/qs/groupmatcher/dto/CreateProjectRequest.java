package com.qs.groupmatcher.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Payload for creating a project.
 *
 * <p>{@code teacherId} stands in for the authenticated user until Spring Security is added;
 * at that point it should be removed and taken from the security context instead.
 */
public record CreateProjectRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description,
        @NotNull @Min(1) @Max(50) Integer groupSize,
        @NotNull Long teacherId,
        @NotEmpty List<@NotNull Long> studentIds) {
}
