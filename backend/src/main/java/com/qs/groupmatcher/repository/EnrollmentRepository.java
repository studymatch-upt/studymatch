package com.qs.groupmatcher.repository;

import com.qs.groupmatcher.model.Enrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    /** All results of a student, course unit already loaded (one query, no N+1). */
    @Query("""
            select e from Enrollment e
            join fetch e.courseUnit cu
            where e.student.id = :studentId
            order by e.academicYear, cu.code, e.attempt
            """)
    List<Enrollment> findWithCourseUnitByStudentId(@Param("studentId") Long studentId);

    Optional<Enrollment> findByIdAndStudentId(Long id, Long studentId);

    boolean existsByStudentIdAndCourseUnitIdAndAttempt(Long studentId, Long courseUnitId, int attempt);

    long countByStudentId(Long studentId);
}
