package com.qs.groupmatcher.service;

import com.qs.groupmatcher.dto.EnrollmentRequest;
import com.qs.groupmatcher.dto.EnrollmentResponse;
import com.qs.groupmatcher.dto.GradeUpdateRequest;
import com.qs.groupmatcher.exception.DuplicateResourceException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.model.Enrollment;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import com.qs.groupmatcher.repository.EnrollmentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** A student's academic history: results per course unit, including repeated attempts. */
@Service
@Transactional(readOnly = true)
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final StudentLookup studentLookup;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             CourseUnitRepository courseUnitRepository,
                             StudentLookup studentLookup) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseUnitRepository = courseUnitRepository;
        this.studentLookup = studentLookup;
    }

    @Transactional
    public EnrollmentResponse add(Long studentId, EnrollmentRequest request) {
        User student = studentLookup.requireStudent(studentId);
        String code = CourseUnitService.normalizeCode(request.courseUnitCode());
        CourseUnit courseUnit = courseUnitRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Course unit", code));

        if (enrollmentRepository.existsByStudentIdAndCourseUnitIdAndAttempt(
                studentId, courseUnit.getId(), request.attempt())) {
            throw new DuplicateResourceException("Student " + studentId + " already has attempt "
                    + request.attempt() + " of " + code);
        }

        Enrollment saved = enrollmentRepository.save(new Enrollment(
                student, courseUnit, request.academicYear(), request.attempt(), request.grade()));
        return EnrollmentResponse.from(saved);
    }

    public List<EnrollmentResponse> list(Long studentId) {
        studentLookup.requireStudent(studentId);
        return enrollmentRepository.findWithCourseUnitByStudentId(studentId).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    @Transactional
    public EnrollmentResponse updateGrade(Long studentId, Long enrollmentId, GradeUpdateRequest request) {
        Enrollment enrollment = findOwned(studentId, enrollmentId);
        enrollment.changeGrade(request.grade());
        return EnrollmentResponse.from(enrollment);
    }

    @Transactional
    public void delete(Long studentId, Long enrollmentId) {
        enrollmentRepository.delete(findOwned(studentId, enrollmentId));
    }

    /** An enrollment is only reachable through the student it belongs to. */
    private Enrollment findOwned(Long studentId, Long enrollmentId) {
        return enrollmentRepository.findByIdAndStudentId(enrollmentId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", enrollmentId));
    }
}
