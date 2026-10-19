package com.qs.groupmatcher.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CourseUnitApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private ResultActions createUnit(String body) throws Exception {
        return mockMvc.perform(post("/api/course-units").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private static String body(String code, String weights) {
        return """
                {"code":"%s","name":"Test unit","curricularYear":1,"semester":1,"competencyWeights":%s}
                """.formatted(code, weights);
    }

    @Test
    void createsAndReadsACourseUnit() throws Exception {
        String location = createUnit(body("tst1", "{\"PROGRAMMING\":0.7,\"MATHEMATICS_AND_LOGIC\":0.3}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/course-units/")))
                .andExpect(jsonPath("$.code").value("TST1"))
                .andExpect(jsonPath("$.competencyWeights.PROGRAMMING").value(0.7))
                .andReturn().getResponse().getHeader("Location");

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test unit"));

        mockMvc.perform(get("/api/course-units"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.code == 'TST1')]", hasSize(1)));
    }

    @Test
    void rejectsADuplicateCodeIgnoringCase() throws Exception {
        createUnit(body("TST2", "{\"PROGRAMMING\":1.0}")).andExpect(status().isCreated());

        createUnit(body("tst2", "{\"PROGRAMMING\":1.0}")).andExpect(status().isConflict());
    }

    @Test
    void rejectsWeightsOutsideZeroExclusiveToOne() throws Exception {
        createUnit(body("TST3", "{\"PROGRAMMING\":1.5}")).andExpect(status().isBadRequest());
        createUnit(body("TST3", "{\"PROGRAMMING\":0}")).andExpect(status().isBadRequest());
    }

    @Test
    void rejectsACourseUnitWithoutAnyWeight() throws Exception {
        createUnit(body("TST4", "{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.competencyWeights").exists());
    }

    @Test
    void rejectsAnInvalidCode() throws Exception {
        createUnit(body("bad code!", "{\"PROGRAMMING\":1.0}")).andExpect(status().isBadRequest());
    }

    @Test
    void unknownIdIsNotFound() throws Exception {
        mockMvc.perform(get("/api/course-units/999999")).andExpect(status().isNotFound());
    }
}
