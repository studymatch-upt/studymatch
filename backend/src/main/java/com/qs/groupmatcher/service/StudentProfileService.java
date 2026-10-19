package com.qs.groupmatcher.service;

import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.model.Enrollment;
import com.qs.groupmatcher.repository.EnrollmentRepository;
import com.qs.groupmatcher.repository.QuestionnaireAnswerRepository;
import com.qs.groupmatcher.service.profile.Competency;
import com.qs.groupmatcher.service.profile.GradeEvidence;
import com.qs.groupmatcher.service.profile.ProfileCalculator;
import com.qs.groupmatcher.service.profile.StudentProfile;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads the stored answers and results, translates them to the calculator's input types and
 * returns its result. The profile is never stored; it is recalculated on every request.
 */
@Service
@Transactional(readOnly = true)
public class StudentProfileService {

    private final EnrollmentRepository enrollmentRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final StudentLookup studentLookup;
    private final ProfileCalculator calculator;

    public StudentProfileService(EnrollmentRepository enrollmentRepository,
                                 QuestionnaireAnswerRepository answerRepository,
                                 StudentLookup studentLookup,
                                 ProfileCalculator calculator) {
        this.enrollmentRepository = enrollmentRepository;
        this.answerRepository = answerRepository;
        this.studentLookup = studentLookup;
        this.calculator = calculator;
    }

    public StudentProfile profileOf(Long studentId) {
        studentLookup.requireStudent(studentId);

        List<GradeEvidence> grades = enrollmentRepository.findWithCourseUnitByStudentId(studentId).stream()
                .map(StudentProfileService::toEvidence)
                .toList();

        Map<Competency, Integer> answers = new EnumMap<>(Competency.class);
        answerRepository.findByStudentId(studentId).forEach(a -> answers.put(a.getCompetency(), a.getAnswer()));

        return calculator.calculate(answers, grades);
    }

    private static GradeEvidence toEvidence(Enrollment enrollment) {
        CourseUnit unit = enrollment.getCourseUnit();
        return new GradeEvidence(unit.getCode(), enrollment.getAttempt(),
                enrollment.getGrade().doubleValue(), unit.getCompetencyWeights());
    }
}
