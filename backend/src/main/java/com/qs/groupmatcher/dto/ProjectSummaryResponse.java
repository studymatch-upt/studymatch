package com.qs.groupmatcher.dto;

import java.time.Instant;

/** Row in the teacher's project list. Built directly by a JPQL constructor expression. */
public record ProjectSummaryResponse(
        Long id,
        String name,
        Integer groupSize,
        Long groupCount,
        Long studentCount,
        Instant createdAt) {
}
