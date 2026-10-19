package com.qs.groupmatcher.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qs.groupmatcher.dto.CourseUnitRequest;
import com.qs.groupmatcher.dto.CourseUnitResponse;
import com.qs.groupmatcher.exception.DuplicateResourceException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import com.qs.groupmatcher.service.profile.Competency;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CourseUnitServiceTest {

    @Mock
    private CourseUnitRepository repository;

    @InjectMocks
    private CourseUnitService service;

    private static CourseUnitRequest request(String code) {
        return new CourseUnitRequest(code, "  Algoritmos  ", 1, 1,
                Map.of(Competency.PROGRAMMING, 0.7, Competency.MATHEMATICS_AND_LOGIC, 0.3));
    }

    @Test
    void createStoresUpperCaseCodeAndTrimmedName() {
        when(repository.existsByCode("AED")).thenReturn(false);
        when(repository.save(any(CourseUnit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CourseUnitResponse response = service.create(request(" aed "));

        assertThat(response.code()).isEqualTo("AED");
        assertThat(response.name()).isEqualTo("Algoritmos");
        assertThat(response.competencyWeights())
                .containsEntry(Competency.PROGRAMMING, 0.7)
                .containsEntry(Competency.MATHEMATICS_AND_LOGIC, 0.3);
    }

    @Test
    void createRejectsAnExistingCodeIgnoringCase() {
        when(repository.existsByCode("AED")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request("aed")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("AED");
        verify(repository, never()).save(any(CourseUnit.class));
    }

    @Test
    void getThrowsWhenTheCourseUnitDoesNotExist() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.get(99L)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listMapsEveryCourseUnit() {
        CourseUnit am = new CourseUnit("AM", "Análise", 1, 1, Map.of(Competency.MATHEMATICS_AND_LOGIC, 1.0));
        when(repository.findAllByOrderByCurricularYearAscSemesterAscCodeAsc()).thenReturn(List.of(am));

        assertThat(service.list()).extracting(CourseUnitResponse::code).containsExactly("AM");
    }
}
