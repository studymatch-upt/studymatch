package com.qs.groupmatcher.service.grouping;

import java.util.List;

/**
 * Splits a list of participants into groups.
 *
 * <p>This is the extension point for matching criteria (grades, strengths, preferences...).
 * Each criterion becomes a new implementation; {@code ProjectService} does not change.
 */
public interface GroupFormationStrategy {

    /**
     * @param participants the people to distribute; never null, may be empty
     * @param maxGroupSize the largest allowed group; must be at least 1
     * @return the groups, each non-empty, together containing every participant exactly once
     */
    <T> List<List<T>> formGroups(List<T> participants, int maxGroupSize);
}
