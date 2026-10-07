package com.qs.groupmatcher.service.grouping;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * No matching criteria: participants are dealt round-robin, in the order given,
 * into the fewest groups that respect the maximum size.
 *
 * <p>Using ceil(n / maxGroupSize) groups and dealing round-robin means no group exceeds the
 * maximum and group sizes differ by at most one. For example 10 students with size 3 gives
 * 3/3/2/2 rather than 3/3/3/1, so nobody is left alone in a remainder group.
 */
@Component
public class BalancedSequentialGroupFormationStrategy implements GroupFormationStrategy {

    @Override
    public <T> List<List<T>> formGroups(List<T> participants, int maxGroupSize) {
        if (participants == null) {
            throw new IllegalArgumentException("participants must not be null");
        }
        if (maxGroupSize < 1) {
            throw new IllegalArgumentException("maxGroupSize must be at least 1, was " + maxGroupSize);
        }
        if (participants.isEmpty()) {
            return List.of();
        }

        int groupCount = Math.ceilDiv(participants.size(), maxGroupSize);
        List<List<T>> groups = new ArrayList<>(groupCount);
        for (int i = 0; i < groupCount; i++) {
            groups.add(new ArrayList<>());
        }
        for (int i = 0; i < participants.size(); i++) {
            groups.get(i % groupCount).add(participants.get(i));
        }
        return groups;
    }
}
