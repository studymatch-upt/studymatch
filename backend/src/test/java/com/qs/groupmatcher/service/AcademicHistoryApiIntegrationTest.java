package com.qs.groupmatcher.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.qs.groupmatcher.model.CourseUnit;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import com.qs.groupmatcher.repository.UserRepository;
import com.qs.groupmatcher.service.profile.Competency;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import com.qs.groupmatcher.model.User;

/** Enrollments, questionnaire and profile through HTTP, on the Flyway + Hibernate H2 database. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AcademicHistoryApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseUnitRepository courseUnitRepository;

    private long studentId;

    @BeforeEach
    void createStudentAndCourseUnits() {
        studentId = userRepository.save(new User("Test Student", "test.student@school.test", Role.STUDENT)).getId();
        courseUnitRepository.save(new CourseUnit("XAED", "Algoritmos X", 1, 1,
                Map.of(Competency.PROGRAMMING, 0.7, Competency.MATHEMATICS_AND_LOGIC, 0.3)));
        courseUnitRepository.save(new CourseUnit("XBD", "Bases de Dados X", 1, 2,
                Map.of(Competency.DATABASES, 0.8, Competency.PROGRAMMING, 0.2)));
    }

    private String base() {
        return "/api/students/" + studentId;
    }

    private static String enrollment(String code, int year, int attempt, String grade) {
        return """
                {"courseUnitCode":"%s","academicYear":%d,"attempt":%d,"grade":%s}
                """.formatted(code, year, attempt, grade);
    }

    private ResultActions addEnrollment(String body) throws Exception {
        return mockMvc.perform(post(base() + "/enrollments").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions putQuestionnaire(String answersJson) throws Exception {
        return mockMvc.perform(put(base() + "/questionnaire").contentType(MediaType.APPLICATION_JSON)
                .content("{\"answers\":" + answersJson + "}"));
    }

    // ---- enrollments -------------------------------------------------------------------------

    @Test
    void addsAnEnrollmentAndListsIt() throws Exception {
        addEnrollment(enrollment("xaed", 2024, 1, "14.5"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/enrollments/")))
                .andExpect(jsonPath("$.courseUnitCode").value("XAED"))
                .andExpect(jsonPath("$.academicYearLabel").value("2024/25"))
                .andExpect(jsonPath("$.grade").value(14.5));

        mockMvc.perform(get(base() + "/enrollments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void aRepeatedCourseUnitKeepsEveryAttemptButNotTheSameAttemptTwice() throws Exception {
        addEnrollment(enrollment("XAED", 2024, 1, "8")).andExpect(status().isCreated());
        addEnrollment(enrollment("XAED", 2025, 2, "16")).andExpect(status().isCreated());
        addEnrollment(enrollment("XAED", 2025, 2, "17")).andExpect(status().isConflict());

        mockMvc.perform(get(base() + "/enrollments"))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].attempt").value(1))
                .andExpect(jsonPath("$[1].attempt").value(2));
    }

    @Test
    void rejectsBadEnrollments() throws Exception {
        addEnrollment(enrollment("NOPE", 2024, 1, "10")).andExpect(status().isNotFound());
        addEnrollment(enrollment("XAED", 2024, 1, "21"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.grade").exists());
        addEnrollment(enrollment("XAED", 2024, 0, "10")).andExpect(status().isBadRequest());
    }

    @Test
    void unknownStudentsAndTeachersHaveNoAcademicHistory() throws Exception {
        long teacherId = userRepository.findByRoleOrderByNameAsc(Role.TEACHER).getFirst().getId();

        mockMvc.perform(post("/api/students/999999/enrollments").contentType(MediaType.APPLICATION_JSON)
                .content(enrollment("XAED", 2024, 1, "10"))).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/students/" + teacherId + "/enrollments")).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/students/" + teacherId + "/profile")).andExpect(status().isNotFound());
    }

    @Test
    void updatesAGradeAndDeletesAnEnrollment() throws Exception {
        String location = addEnrollment(enrollment("XAED", 2024, 1, "8"))
                .andReturn().getResponse().getHeader("Location");

        mockMvc.perform(put(location).contentType(MediaType.APPLICATION_JSON).content("{\"grade\":18}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.grade").value(18.0));

        mockMvc.perform(put(location).contentType(MediaType.APPLICATION_JSON).content("{\"grade\":25}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete(location)).andExpect(status().isNoContent());
        mockMvc.perform(get(base() + "/enrollments")).andExpect(jsonPath("$", hasSize(0)));
    }

    // ---- questionnaire -----------------------------------------------------------------------

    @Test
    void questionnaireIsReplacedNotMerged() throws Exception {
        putQuestionnaire("{\"PROGRAMMING\":4,\"DATABASES\":2}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answers.PROGRAMMING").value(4));

        putQuestionnaire("{\"COMMUNICATION\":5}").andExpect(status().isOk());

        mockMvc.perform(get(base() + "/questionnaire"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answers.COMMUNICATION").value(5))
                .andExpect(jsonPath("$.answers.PROGRAMMING").doesNotExist())
                .andExpect(jsonPath("$.answers.DATABASES").doesNotExist());
    }

    @Test
    void rejectsInvalidAnswers() throws Exception {
        putQuestionnaire("{\"PROGRAMMING\":6}").andExpect(status().isBadRequest());
        putQuestionnaire("{\"PROGRAMMING\":0}").andExpect(status().isBadRequest());
        putQuestionnaire("{}").andExpect(status().isBadRequest());
        putQuestionnaire("{\"JUGGLING\":3}").andExpect(status().isBadRequest());
    }

    // ---- profile -----------------------------------------------------------------------------

    @Test
    void aStudentWithNoDataHasAnEntirelyUnknownProfile() throws Exception {
        mockMvc.perform(get(base() + "/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questionnaireWeight").value(1.0))
                .andExpect(jsonPath("$.completedCourseUnits").value(0))
                .andExpect(jsonPath("$.unknownCompetencies", hasSize(6)));
    }

    @Test
    void profileCombinesQuestionnaireAndLatestAttemptOnly() throws Exception {
        putQuestionnaire("{\"PROGRAMMING\":3}").andExpect(status().isOk());
        addEnrollment(enrollment("XAED", 2024, 1, "8")).andExpect(status().isCreated());
        addEnrollment(enrollment("XAED", 2025, 2, "16")).andExpect(status().isCreated());

        // 1 evaluated unit -> alpha 0.9. PROGRAMMING: 0.9*50 + 0.1*80 = 53. MATH: grades only = 80.
        mockMvc.perform(get(base() + "/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completedCourseUnits").value(1))
                .andExpect(jsonPath("$.questionnaireWeight").value(0.9))
                .andExpect(jsonPath("$.academicWeight").value(0.1))
                .andExpect(jsonPath("$.scores.PROGRAMMING").value(53.0))
                .andExpect(jsonPath("$.scores.MATHEMATICS_AND_LOGIC").value(80.0))
                .andExpect(jsonPath("$.unknownCompetencies", hasSize(4)));
    }

    @Test
    void profileOfAnUnknownStudentIsNotFound() throws Exception {
        mockMvc.perform(get("/api/students/999999/profile")).andExpect(status().isNotFound());
    }
}
