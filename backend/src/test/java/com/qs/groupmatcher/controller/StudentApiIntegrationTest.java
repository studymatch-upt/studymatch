package com.qs.groupmatcher.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Full stack: HTTP -> controller -> service -> JPA -> H2. Uses the seeded users; each test rolls back. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class StudentApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createsAndReadsAStudent() throws Exception {
        String location = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Rui Silva", "rui@school.test", "20260001", 2)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/students/")))
                .andExpect(jsonPath("$.studentNumber").value("20260001"))
                .andReturn().getResponse().getHeader("Location");

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Rui Silva"))
                .andExpect(jsonPath("$.email").value("rui@school.test"))
                .andExpect(jsonPath("$.curricularYear").value(2));
    }

    @Test
    void rejectsDuplicateEmail() throws Exception {
        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Other Carla", "carla@school.test", "777", 1)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Already exists"));
    }

    @Test
    void invalidPayloadReturnsFieldErrors() throws Exception {
        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("", "not-an-email", "", 9)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.studentNumber").exists())
                .andExpect(jsonPath("$.fieldErrors.curricularYear").exists());
    }

    @Test
    void updatesASeededStudent() throws Exception {
        long id = userRepository.findByRoleOrderByNameAsc(Role.STUDENT).getFirst().getId();

        mockMvc.perform(put("/api/students/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("Renamed Student", "renamed@school.test", "555", 3)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed Student"))
                .andExpect(jsonPath("$.curricularYear").value(3));

        mockMvc.perform(get("/api/students/" + id))
                .andExpect(jsonPath("$.studentNumber").value("555"));
    }

    @Test
    void teachersAreNotReachableThroughTheStudentEndpoints() throws Exception {
        long teacherId = userRepository.findByRoleOrderByNameAsc(Role.TEACHER).getFirst().getId();

        mockMvc.perform(get("/api/students/" + teacherId)).andExpect(status().isNotFound());
        mockMvc.perform(put("/api/students/" + teacherId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("X", "x@school.test", "1", 1)))
                .andExpect(status().isNotFound());
    }

    @Test
    void searchesFiltersAndSorts() throws Exception {
        userRepository.save(User.student("Zed Test", "zed@school.test", "9001", 3));
        userRepository.save(User.student("Abel Test", "abel@school.test", "9002", 3));
        userRepository.save(User.student("Mid Test", "mid@school.test", "9003", 4));

        mockMvc.perform(get("/api/students")
                        .param("curricularYear", "3").param("sortBy", "name").param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Zed Test"))
                .andExpect(jsonPath("$[1].name").value("Abel Test"));

        mockMvc.perform(get("/api/students").param("search", "ABEL"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].studentNumber").value("9002"));

        mockMvc.perform(get("/api/students").param("search", "9003"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Mid Test"));
    }

    @Test
    void unknownSortFieldIsRejected() throws Exception {
        mockMvc.perform(get("/api/students").param("sortBy", "password"))
                .andExpect(status().is(422));
    }

    private static String body(String name, String email, String studentNumber, int year) {
        return """
                {"name": "%s", "email": "%s", "studentNumber": "%s", "curricularYear": %d}
                """.formatted(name, email, studentNumber, year);
    }
}
