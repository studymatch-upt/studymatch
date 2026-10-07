package com.qs.groupmatcher.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** A group of students inside a project. Named ProjectGroup because GROUP is an SQL keyword. */
@Entity
@Table(name = "project_group")
public class ProjectGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "group_number", nullable = false)
    private int number;

    @ManyToMany
    @JoinTable(
            name = "project_group_member",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id"))
    @OrderBy("name ASC")
    private List<User> members = new ArrayList<>();

    protected ProjectGroup() {
        // for JPA
    }

    ProjectGroup(Project project, int number, List<User> members) {
        this.project = project;
        this.number = number;
        this.members = new ArrayList<>(members);
    }

    public Long getId() {
        return id;
    }

    public Project getProject() {
        return project;
    }

    public int getNumber() {
        return number;
    }

    public String getDisplayName() {
        return "Group " + number;
    }

    public List<User> getMembers() {
        return Collections.unmodifiableList(members);
    }
}
