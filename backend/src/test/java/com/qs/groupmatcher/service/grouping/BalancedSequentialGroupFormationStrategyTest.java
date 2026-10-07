package com.qs.groupmatcher.service.grouping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class BalancedSequentialGroupFormationStrategyTest {

    private final GroupFormationStrategy strategy = new BalancedSequentialGroupFormationStrategy();

    @ParameterizedTest(name = "{0} students, max {1} -> sizes {2}")
    @CsvSource(delimiter = ';', value = {
        "12; 4; 4,4,4",
        "10; 3; 3,3,2,2",
        "10; 4; 4,3,3",
        "7;  2; 2,2,2,1",
        "5;  5; 5",
        "3;  10; 3",
        "4;  1; 1,1,1,1"
    })
    void producesFewestGroupsWithBalancedSizes(int studentCount, int maxSize, String expectedSizes) {
        List<List<Integer>> groups = strategy.formGroups(participants(studentCount), maxSize);

        List<Integer> sizes = groups.stream().map(List::size).toList();
        List<Integer> expected = List.of(expectedSizes.split(",")).stream().map(Integer::valueOf).toList();
        assertThat(sizes).isEqualTo(expected);
    }

    @Test
    void everyParticipantIsPlacedExactlyOnce() {
        List<Integer> participants = participants(23);

        List<List<Integer>> groups = strategy.formGroups(participants, 4);

        assertThat(groups.stream().flatMap(List::stream).toList())
                .containsExactlyInAnyOrderElementsOf(participants);
    }

    @Test
    void dealsParticipantsRoundRobinInInputOrder() {
        List<List<String>> groups = strategy.formGroups(List.of("a", "b", "c", "d", "e"), 3);

        assertThat(groups).containsExactly(List.of("a", "c", "e"), List.of("b", "d"));
    }

    @Test
    void returnsNoGroupsForNoParticipants() {
        assertThat(strategy.formGroups(List.of(), 3)).isEmpty();
    }

    @Test
    void rejectsGroupSizeBelowOne() {
        assertThatThrownBy(() -> strategy.formGroups(List.of("a"), 0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsNullParticipants() {
        assertThatThrownBy(() -> strategy.formGroups(null, 3))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private static List<Integer> participants(int count) {
        return IntStream.rangeClosed(1, count).boxed().toList();
    }
}
