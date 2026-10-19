package com.qs.groupmatcher.repository;

import com.qs.groupmatcher.model.QuestionnaireAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionnaireAnswerRepository extends JpaRepository<QuestionnaireAnswer, Long> {

    List<QuestionnaireAnswer> findByStudentId(Long studentId);
}
