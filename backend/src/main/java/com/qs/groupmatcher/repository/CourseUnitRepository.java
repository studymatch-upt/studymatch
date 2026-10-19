package com.qs.groupmatcher.repository;

import com.qs.groupmatcher.model.CourseUnit;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    boolean existsByCode(String code);

    Optional<CourseUnit> findByCode(String code);

    List<CourseUnit> findAllByOrderByCurricularYearAscSemesterAscCodeAsc();
}
