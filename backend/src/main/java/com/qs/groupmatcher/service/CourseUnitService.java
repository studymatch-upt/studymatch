package com.qs.groupmatcher.service;

import com.qs.groupmatcher.dto.CourseUnitRequest;
import com.qs.groupmatcher.dto.CourseUnitResponse;
import com.qs.groupmatcher.exception.DuplicateResourceException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CourseUnitService {

    private final CourseUnitRepository repository;

    public CourseUnitService(CourseUnitRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public CourseUnitResponse create(CourseUnitRequest request) {
        String code = normalizeCode(request.code());
        if (repository.existsByCode(code)) {
            throw new DuplicateResourceException("Course unit " + code + " already exists");
        }
        CourseUnit saved = repository.save(new CourseUnit(code, request.name().strip(),
                request.curricularYear(), request.semester(), request.competencyWeights()));
        return CourseUnitResponse.from(saved);
    }

    public List<CourseUnitResponse> list() {
        return repository.findAllByOrderByCurricularYearAscSemesterAscCodeAsc().stream()
                .map(CourseUnitResponse::from)
                .toList();
    }

    public CourseUnitResponse get(Long id) {
        return repository.findById(id)
                .map(CourseUnitResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Course unit", id));
    }

    /** Codes are case-insensitive for the user ("aed" = "AED") and stored upper-case. */
    static String normalizeCode(String code) {
        return code.strip().toUpperCase(Locale.ROOT);
    }
}
