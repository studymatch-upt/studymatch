package com.qs.groupmatcher.model;

import com.qs.groupmatcher.service.profile.Competency;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.MapKeyEnumerated;
import jakarta.persistence.Table;
import java.util.Collections;
import java.util.EnumMap;
import java.util.Map;
import org.hibernate.annotations.MapKeyJdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "course_unit")
public class CourseUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "curricular_year", nullable = false)
    private int curricularYear;

    @Column(nullable = false)
    private int semester;

    // Map key stored as VARCHAR (not a native MySQL ENUM), same reason as User.role.
    @ElementCollection
    @CollectionTable(name = "course_unit_competency_weight",
            joinColumns = @JoinColumn(name = "course_unit_id"))
    @MapKeyColumn(name = "competency", length = 40)
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyJdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "weight", nullable = false)
    private Map<Competency, Double> competencyWeights = new EnumMap<>(Competency.class);

    protected CourseUnit() {
        // for JPA
    }

    public CourseUnit(String code, String name, int curricularYear, int semester,
                      Map<Competency, Double> competencyWeights) {
        if (competencyWeights == null || competencyWeights.isEmpty()) {
            throw new IllegalArgumentException("A course unit must contribute to at least one competency");
        }
        this.code = code;
        this.name = name;
        this.curricularYear = curricularYear;
        this.semester = semester;
        this.competencyWeights = new EnumMap<>(Competency.class);
        this.competencyWeights.putAll(competencyWeights);
    }

    public Long getId() { return id; }

    public String getCode() { return code; }

    public String getName() { return name; }

    public int getCurricularYear() { return curricularYear; }

    public int getSemester() { return semester; }

    public Map<Competency, Double> getCompetencyWeights() {
        return Collections.unmodifiableMap(competencyWeights);
    }
}
