package com.qs.groupmatcher.repository;

import com.qs.groupmatcher.dto.ProjectSummaryResponse;
import com.qs.groupmatcher.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    /** One query for the whole list instead of loading every group and member. */
    @Query("""
            select new com.qs.groupmatcher.dto.ProjectSummaryResponse(
                p.id, p.name, p.groupSize, count(distinct g.id), count(m.id), p.createdAt)
            from Project p
            left join p.groups g
            left join g.members m
            where p.teacher.id = :teacherId
            group by p.id, p.name, p.groupSize, p.createdAt
            order by p.createdAt desc
            """)
    List<ProjectSummaryResponse> findSummariesByTeacherId(@Param("teacherId") Long teacherId);
}
