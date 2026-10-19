package com.qs.groupmatcher.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // Stored as VARCHAR; without @JdbcTypeCode Hibernate expects a native MySQL ENUM column.
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 20)
    private Role role;

    /** Institutional identifier. Only students have one. Nullable: several NULLs are allowed under UNIQUE. */
    @Column(name = "student_number", unique = true, length = 20)
    private String studentNumber;

    /** 1 = first year of the degree. Only students have one. */
    @Column(name = "curricular_year")
    private Integer curricularYear;

    protected User() {
        // for JPA
    }

    public User(String name, String email, Role role) {
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public static User student(String name, String email, String studentNumber, int curricularYear) {
        User student = new User(name, email, Role.STUDENT);
        student.studentNumber = studentNumber;
        student.curricularYear = curricularYear;
        return student;
    }

    /** Update of a student's editable data; the role never changes. */
    public void updateStudent(String name, String email, String studentNumber, int curricularYear) {
        if (role != Role.STUDENT) {
            throw new IllegalStateException("Only students have student details");
        }
        this.name = name;
        this.email = email;
        this.studentNumber = studentNumber;
        this.curricularYear = curricularYear;
    }

    public boolean hasRole(Role expected) {
        return role == expected;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public String getStudentNumber() { return studentNumber; }
    public Integer getCurricularYear() { return curricularYear; }
}
