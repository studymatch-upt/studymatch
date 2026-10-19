package com.qs.groupmatcher.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Body of POST /api/students/{id}/enrollments.
 *
 * @param academicYear calendar year in which the academic year starts (2024 = 2024/25)
 * @param attempt      1 for the first attempt, 2 for the second...
 */
public record EnrollmentRequest(
        @NotBlank @Size(max = 20) String courseUnitCode,
        @NotNull @Min(2000) @Max(2100) Integer academicYear,
        @NotNull @Min(1) @Max(20) Integer attempt,
        @NotNull @DecimalMin("0") @DecimalMax("20") @Digits(integer = 2, fraction = 2) BigDecimal grade) {
}
