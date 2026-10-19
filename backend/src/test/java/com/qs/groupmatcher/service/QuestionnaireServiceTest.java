package com.qs.groupmatcher.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qs.groupmatcher.dto.QuestionnaireRequest;
import com.qs.groupmatcher.dto.QuestionnaireResponse;
import com.qs.groupmatcher.model.QuestionnaireAnswer;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.QuestionnaireAnswerRepository;
import com.qs.groupmatcher.service.profile.Competency;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QuestionnaireServiceTest {

    private static final long STUDENT_ID = 5L;

    @Mock
    private QuestionnaireAnswerRepository repository;

    @Mock
    private StudentLookup studentLookup;

    @InjectMocks
    private QuestionnaireService service;

    private final User student = new User("Carla", "carla@test", Role.STUDENT);

    @Test
    void replaceUpdatesExistingAddsNewAndRemovesTheOnesNotSent() {
        QuestionnaireAnswer programming = new QuestionnaireAnswer(student, Competency.PROGRAMMING, 2);
        QuestionnaireAnswer databases = new QuestionnaireAnswer(student, Competency.DATABASES, 3);
        when(studentLookup.requireStudent(STUDENT_ID)).thenReturn(student);
        when(repository.findByStudentId(STUDENT_ID)).thenReturn(List.of(programming, databases));

        QuestionnaireResponse response = service.replace(STUDENT_ID, new QuestionnaireRequest(
                Map.of(Competency.PROGRAMMING, 5, Competency.COMMUNICATION, 4)));

        assertThat(programming.getAnswer()).isEqualTo(5);
        verify(repository).deleteAll(List.of(databases));
        ArgumentCaptor<QuestionnaireAnswer> saved = ArgumentCaptor.forClass(QuestionnaireAnswer.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getCompetency()).isEqualTo(Competency.COMMUNICATION);
        assertThat(saved.getValue().getAnswer()).isEqualTo(4);
        assertThat(response.answers()).containsOnly(
                Map.entry(Competency.PROGRAMMING, 5), Map.entry(Competency.COMMUNICATION, 4));
    }

    @Test
    void getReturnsTheStoredAnswers() {
        when(repository.findByStudentId(STUDENT_ID))
                .thenReturn(List.of(new QuestionnaireAnswer(student, Competency.DESIGN_AND_UX, 5)));

        assertThat(service.get(STUDENT_ID).answers()).containsOnly(Map.entry(Competency.DESIGN_AND_UX, 5));
    }
}
