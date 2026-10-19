package com.qs.groupmatcher.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/** Body of PUT /api/students/{id}/enrollments/{enrollmentId}: only the grade can change. */
public record GradeUpdateRequest(
        @NotNull @DecimalMin("0") @DecimalMax("20") @Digits(integer = 2, fraction = 2) BigDecimal grade) {
}
