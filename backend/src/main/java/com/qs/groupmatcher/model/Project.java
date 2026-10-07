package com.qs.groupmatcher.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(name = "group_size", nullable = false)
    private int groupSize;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("number ASC")
    private List<ProjectGroup> groups = new ArrayList<>();

    protected Project() {
        // for JPA
    }

    public Project(String name, String description, int groupSize, User teacher) {
        this.name = name;
        this.description = description;
        this.groupSize = groupSize;
        this.teacher = teacher;
    }

    /** Creates the next numbered group in this project with the given members. */
    public ProjectGroup addGroup(List<User> members) {
        ProjectGroup group = new ProjectGroup(this, groups.size() + 1, members);
        groups.add(group);
        return group;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public int getGroupSize() {
        return groupSize;
    }

    public User getTeacher() {
        return teacher;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<ProjectGroup> getGroups() {
        return Collections.unmodifiableList(groups);
    }
}
