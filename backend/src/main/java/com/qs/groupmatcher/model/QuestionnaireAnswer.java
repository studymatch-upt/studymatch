package com.qs.groupmatcher.model;

import com.qs.groupmatcher.service.profile.Competency;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A student's answer (1-5) to the onboarding statement of one competency. */
@Entity
@Table(name = "questionnaire_answer",
        uniqueConstraints = @UniqueConstraint(name = "uk_questionnaire_student_competency",
                columnNames = {"student_id", "competency"}))
public class QuestionnaireAnswer {

    public static final int MIN_ANSWER = 1;
    public static final int MAX_ANSWER = 5;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 40)
    private Competency competency;

    @Column(nullable = false)
    private int answer;

    protected QuestionnaireAnswer() {
        // for JPA
    }

    public QuestionnaireAnswer(User student, Competency competency, int answer) {
        this.student = student;
        this.competency = competency;
        this.answer = validAnswer(answer);
    }

    public void changeAnswer(int newAnswer) {
        this.answer = validAnswer(newAnswer);
    }

    private static int validAnswer(int value) {
        if (value < MIN_ANSWER || value > MAX_ANSWER) {
            throw new IllegalArgumentException("answer must be between 1 and 5, was " + value);
        }
        return value;
    }

    public Long getId() { return id; }

    public User getStudent() { return student; }

    public Competency getCompetency() { return competency; }

    public int getAnswer() { return answer; }
}
