package com.qs.groupmatcher.seed;

import static com.qs.groupmatcher.service.profile.Competency.COMMUNICATION;
import static com.qs.groupmatcher.service.profile.Competency.DATABASES;
import static com.qs.groupmatcher.service.profile.Competency.DESIGN_AND_UX;
import static com.qs.groupmatcher.service.profile.Competency.MATHEMATICS_AND_LOGIC;
import static com.qs.groupmatcher.service.profile.Competency.ORGANISATION_AND_LEADERSHIP;
import static com.qs.groupmatcher.service.profile.Competency.PROGRAMMING;

import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.model.Enrollment;
import com.qs.groupmatcher.model.QuestionnaireAnswer;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import com.qs.groupmatcher.repository.EnrollmentRepository;
import com.qs.groupmatcher.repository.QuestionnaireAnswerRepository;
import com.qs.groupmatcher.repository.UserRepository;
import com.qs.groupmatcher.service.profile.Competency;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Demo data from docs/sprint2-design-decisions.md (section 8). Done in code, not Flyway, because
 * Hibernate (ddl-auto: update) creates these tables after Flyway has run. Idempotent: it only adds
 * what is missing and never touches a student who already has data.
 */
@Component
public class DemoAcademicDataSeeder {

    private record CourseUnitSeed(String code, String name, int year, int semester,
                                  Map<Competency, Double> weights) {
    }

    private static final List<CourseUnitSeed> COURSE_UNITS = List.of(
            new CourseUnitSeed("AM", "Análise Matemática", 1, 1,
                    Map.of(MATHEMATICS_AND_LOGIC, 1.0)),
            new CourseUnitSeed("AED", "Algoritmos e Estruturas de Dados", 1, 1,
                    Map.of(PROGRAMMING, 0.7, MATHEMATICS_AND_LOGIC, 0.3)),
            new CourseUnitSeed("BD", "Bases de Dados", 1, 2,
                    Map.of(DATABASES, 0.8, PROGRAMMING, 0.2)),
            new CourseUnitSeed("LAM", "Laboratório de Aplicações Móveis", 2, 1,
                    Map.of(PROGRAMMING, 0.6, DESIGN_AND_UX, 0.4)),
            new CourseUnitSeed("QS", "Qualidade de Software", 2, 1,
                    Map.of(PROGRAMMING, 0.5, ORGANISATION_AND_LEADERSHIP, 0.3, COMMUNICATION, 0.2)),
            new CourseUnitSeed("GP", "Gestão de Projetos", 2, 1,
                    Map.of(ORGANISATION_AND_LEADERSHIP, 0.6, COMMUNICATION, 0.4)));

    private final CourseUnitRepository courseUnitRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuestionnaireAnswerRepository answerRepository;
    private final UserRepository userRepository;

    public DemoAcademicDataSeeder(CourseUnitRepository courseUnitRepository,
                                  EnrollmentRepository enrollmentRepository,
                                  QuestionnaireAnswerRepository answerRepository,
                                  UserRepository userRepository) {
        this.courseUnitRepository = courseUnitRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.answerRepository = answerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void seed() {
        Map<String, CourseUnit> units = new LinkedHashMap<>();
        for (CourseUnitSeed seed : COURSE_UNITS) {
            CourseUnit unit = courseUnitRepository.findByCode(seed.code())
                    .orElseGet(() -> courseUnitRepository.save(new CourseUnit(
                            seed.code(), seed.name(), seed.year(), seed.semester(), seed.weights())));
            units.put(seed.code(), unit);
        }

        List<User> students = userRepository.findByRoleOrderByNameAsc(Role.STUDENT);
        students.stream().filter(s -> "Carla Mendes".equals(s.getName())).findFirst()
                .ifPresent(carla -> seedCarla(carla, units));
        students.stream().filter(s -> "Diogo Ferreira".equals(s.getName())).findFirst()
                .ifPresent(this::seedDiogo);
    }

    /** Scenario A: a student with history, including a repeated course unit (AED 8, then 16). */
    private void seedCarla(User carla, Map<String, CourseUnit> units) {
        if (enrollmentRepository.countByStudentId(carla.getId()) == 0) {
            enrollmentRepository.saveAll(List.of(
                    new Enrollment(carla, units.get("AM"), 2024, 1, new BigDecimal("14")),
                    new Enrollment(carla, units.get("AED"), 2024, 1, new BigDecimal("8")),
                    new Enrollment(carla, units.get("AED"), 2025, 2, new BigDecimal("16")),
                    new Enrollment(carla, units.get("BD"), 2024, 1, new BigDecimal("17"))));
        }
        if (answerRepository.findByStudentId(carla.getId()).isEmpty()) {
            for (Competency competency : Competency.values()) {
                answerRepository.save(new QuestionnaireAnswer(carla, competency, 3));
            }
        }
    }

    /** Scenario B: cold start, questionnaire only. */
    private void seedDiogo(User diogo) {
        if (!answerRepository.findByStudentId(diogo.getId()).isEmpty()) {
            return;
        }
        Map<Competency, Integer> answers = new LinkedHashMap<>();
        answers.put(PROGRAMMING, 4);
        answers.put(MATHEMATICS_AND_LOGIC, 2);
        answers.put(DATABASES, 3);
        answers.put(DESIGN_AND_UX, 5);
        answers.put(COMMUNICATION, 4);
        answers.put(ORGANISATION_AND_LEADERSHIP, 3);
        answers.forEach((competency, value) ->
                answerRepository.save(new QuestionnaireAnswer(diogo, competency, value)));
    }
}
