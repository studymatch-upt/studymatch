package com.qs.groupmatcher.dto;

import com.qs.groupmatcher.model.Enrollment;
import java.math.BigDecimal;

public record EnrollmentResponse(
        Long id,
        String courseUnitCode,
        String courseUnitName,
        int academicYear,
        String academicYearLabel,
        int attempt,
        BigDecimal grade) {

    public static EnrollmentResponse from(Enrollment enrollment) {
        int year = enrollment.getAcademicYear();
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getCourseUnit().getCode(),
                enrollment.getCourseUnit().getName(),
                year,
                "%d/%02d".formatted(year, (year + 1) % 100),
                enrollment.getAttempt(),
                enrollment.getGrade());
    }
}
