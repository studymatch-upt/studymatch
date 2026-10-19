package com.qs.groupmatcher.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * One result of a student in a course unit. A repeated course unit is simply another row with a
 * higher attempt; the profile calculation only looks at the latest one.
 */
@Entity
@Table(name = "enrollment",
        uniqueConstraints = @UniqueConstraint(name = "uk_enrollment_student_unit_attempt",
                columnNames = {"student_id", "course_unit_id", "attempt"}))
public class Enrollment {

    public static final BigDecimal MIN_GRADE = BigDecimal.ZERO;
    public static final BigDecimal MAX_GRADE = BigDecimal.valueOf(20);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_unit_id", nullable = false)
    private CourseUnit courseUnit;

    /** Calendar year in which the academic year starts: 2024 means 2024/25. */
    @Column(name = "academic_year", nullable = false)
    private int academicYear;

    @Column(nullable = false)
    private int attempt;

    /** Final grade on the Portuguese 0-20 scale, two decimals. */
    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal grade;

    protected Enrollment() {
        // for JPA
    }

    public Enrollment(User student, CourseUnit courseUnit, int academicYear, int attempt, BigDecimal grade) {
        if (attempt < 1) {
            throw new IllegalArgumentException("attempt must be at least 1, was " + attempt);
        }
        this.student = student;
        this.courseUnit = courseUnit;
        this.academicYear = academicYear;
        this.attempt = attempt;
        this.grade = validGrade(grade);
    }

    public void changeGrade(BigDecimal newGrade) {
        this.grade = validGrade(newGrade);
    }

    private static BigDecimal validGrade(BigDecimal value) {
        if (value == null || value.compareTo(MIN_GRADE) < 0 || value.compareTo(MAX_GRADE) > 0) {
            throw new IllegalArgumentException("grade must be between 0 and 20, was " + value);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    public Long getId() { return id; }

    public User getStudent() { return student; }

    public CourseUnit getCourseUnit() { return courseUnit; }

    public int getAcademicYear() { return academicYear; }

    public int getAttempt() { return attempt; }

    public BigDecimal getGrade() { return grade; }
}
