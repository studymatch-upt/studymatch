package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.service.profile.Competency;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;

/** Body of POST /api/course-units. Weights are each in ]0, 1]. */
public record CourseUnitRequest(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9]{1,20}", message = "Code must be 1-20 letters or digits")
        String code,
        @NotBlank @Size(max = 120) String name,
        @NotNull @Min(1) @Max(5) Integer curricularYear,
        @NotNull @Min(1) @Max(2) Integer semester,
        @NotEmpty(message = "Give at least one competency weight")
        Map<Competency, @NotNull @DecimalMin(value = "0.0", inclusive = false) @DecimalMax("1.0") Double>
                competencyWeights) {
}
