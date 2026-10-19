package com.qs.groupmatcher.service;

import com.qs.groupmatcher.dto.QuestionnaireRequest;
import com.qs.groupmatcher.dto.QuestionnaireResponse;
import com.qs.groupmatcher.model.QuestionnaireAnswer;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.QuestionnaireAnswerRepository;
import com.qs.groupmatcher.service.profile.Competency;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The cold-start questionnaire: one answer from 1 to 5 per competency. */
@Service
@Transactional(readOnly = true)
public class QuestionnaireService {

    private final QuestionnaireAnswerRepository repository;
    private final StudentLookup studentLookup;

    public QuestionnaireService(QuestionnaireAnswerRepository repository, StudentLookup studentLookup) {
        this.repository = repository;
        this.studentLookup = studentLookup;
    }

    /** Replaces all of the student's answers with the ones in the request. */
    @Transactional
    public QuestionnaireResponse replace(Long studentId, QuestionnaireRequest request) {
        User student = studentLookup.requireStudent(studentId);

        Map<Competency, QuestionnaireAnswer> existing = new EnumMap<>(Competency.class);
        repository.findByStudentId(studentId).forEach(a -> existing.put(a.getCompetency(), a));

        List<QuestionnaireAnswer> removed = existing.entrySet().stream()
                .filter(entry -> !request.answers().containsKey(entry.getKey()))
                .map(Map.Entry::getValue)
                .toList();
        repository.deleteAll(removed);

        request.answers().forEach((competency, value) -> {
            QuestionnaireAnswer current = existing.get(competency);
            if (current == null) {
                repository.save(new QuestionnaireAnswer(student, competency, value));
            } else {
                current.changeAnswer(value);
            }
        });
        return QuestionnaireResponse.of(request.answers());
    }

    public QuestionnaireResponse get(Long studentId) {
        studentLookup.requireStudent(studentId);
        Map<Competency, Integer> answers = new EnumMap<>(Competency.class);
        repository.findByStudentId(studentId).forEach(a -> answers.put(a.getCompetency(), a.getAnswer()));
        return QuestionnaireResponse.of(answers);
    }
}
