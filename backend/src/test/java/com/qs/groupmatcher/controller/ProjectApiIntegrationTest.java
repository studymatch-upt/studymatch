package com.qs.groupmatcher.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Full stack: HTTP -> controller -> service -> JPA -> Flyway-migrated H2 database.
 * Uses the seeded demo users. Each test rolls back.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProjectApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private long teacherId;
    private List<Long> studentIds;

    @BeforeEach
    void loadSeedUsers() {
        teacherId = userRepository.findByRoleOrderByNameAsc(Role.TEACHER).getFirst().getId();
        studentIds = userRepository.findByRoleOrderByNameAsc(Role.STUDENT).stream().map(User::getId).toList();
    }

    @Test
    void teacherCreatesProjectAndGroupsAreFormed() throws Exception {
        List<Long> tenStudents = studentIds.subList(0, 10);

        String location = mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("Software Quality", 3, teacherId, tenStudents)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/projects/")))
                .andExpect(jsonPath("$.name").value("Software Quality"))
                .andExpect(jsonPath("$.groupSize").value(3))
                .andExpect(jsonPath("$.teacher.id").value(teacherId))
                .andExpect(jsonPath("$.groups", hasSize(4)))
                .andExpect(jsonPath("$.groups[0].name").value("Group 1"))
                .andExpect(jsonPath("$.groups[0].members", hasSize(3)))
                .andExpect(jsonPath("$.groups[3].members", hasSize(2)))
                .andReturn().getResponse().getHeader("Location");

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groups", hasSize(4)));

        mockMvc.perform(get("/api/projects").param("teacherId", String.valueOf(teacherId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].groupCount").value(4))
                .andExpect(jsonPath("$[0].studentCount").value(10));
    }

    @Test
    void invalidPayloadReturnsFieldErrors() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("", 0, teacherId, List.of())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.groupSize").exists())
                .andExpect(jsonPath("$.fieldErrors.studentIds").exists());
    }

    @Test
    void studentCannotCreateProject() throws Exception {
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody("P", 2, studentIds.getFirst(), studentIds.subList(1, 3))))
                .andExpect(status().is(422));
    }

    @Test
    void unknownProjectReturns404() throws Exception {
        mockMvc.perform(get("/api/projects/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Project 999999 not found"));
    }

    @Test
    void listsStudents() throws Exception {
        mockMvc.perform(get("/api/users").param("role", "STUDENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(studentIds.size())))
                .andExpect(jsonPath("$[0].role").value("STUDENT"));
    }

    private static String createBody(String name, int groupSize, long teacherId, List<Long> studentIds) {
        String ids = studentIds.stream().map(String::valueOf).collect(Collectors.joining(","));
        return """
                {"name": "%s", "description": "Integration test", "groupSize": %d,
                 "teacherId": %d, "studentIds": [%s]}
                """.formatted(name, groupSize, teacherId, ids);
    }
}
