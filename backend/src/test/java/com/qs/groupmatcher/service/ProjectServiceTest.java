package com.qs.groupmatcher.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.qs.groupmatcher.dto.CreateProjectRequest;
import com.qs.groupmatcher.dto.GroupResponse;
import com.qs.groupmatcher.dto.ProjectDetailResponse;
import com.qs.groupmatcher.dto.UserResponse;
import com.qs.groupmatcher.exception.BusinessRuleException;
import com.qs.groupmatcher.exception.ResourceNotFoundException;
import com.qs.groupmatcher.model.Project;
import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.ProjectRepository;
import com.qs.groupmatcher.repository.UserRepository;
import com.qs.groupmatcher.service.grouping.BalancedSequentialGroupFormationStrategy;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    private static final long TEACHER_ID = 1L;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    private ProjectService service;

    private final User teacher = user(TEACHER_ID, "Teacher", Role.TEACHER);
    private final List<User> students = List.of(
            user(10L, "S10", Role.STUDENT),
            user(11L, "S11", Role.STUDENT),
            user(12L, "S12", Role.STUDENT),
            user(13L, "S13", Role.STUDENT),
            user(14L, "S14", Role.STUDENT));

    @BeforeEach
    void setUp() {
        service = new ProjectService(
                projectRepository, userRepository, new BalancedSequentialGroupFormationStrategy());
    }

    @Test
    void createsProjectWithAutoFormedGroups() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));
        when(userRepository.findAllById(any())).thenReturn(students);
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectDetailResponse result = service.createProject(
                request("  Web App  ", 2, List.of(10L, 11L, 12L, 13L, 14L)));

        assertThat(result.name()).isEqualTo("Web App");
        assertThat(result.groupSize()).isEqualTo(2);
        assertThat(result.teacher().id()).isEqualTo(TEACHER_ID);
        assertThat(result.groups()).extracting(GroupResponse::name)
                .containsExactly("Group 1", "Group 2", "Group 3");
        assertThat(result.groups()).extracting(group -> group.members().stream().map(UserResponse::id).toList())
                .containsExactly(List.of(10L, 13L), List.of(11L, 14L), List.of(12L));
    }

    @Test
    void keepsTheRequestedStudentOrderRegardlessOfRepositoryOrder() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));
        when(userRepository.findAllById(any())).thenReturn(students.reversed());
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectDetailResponse result = service.createProject(request("P", 5, List.of(10L, 11L, 12L, 13L, 14L)));

        assertThat(result.groups().getFirst().members()).extracting(UserResponse::id)
                .containsExactly(10L, 11L, 12L, 13L, 14L);
    }

    @Test
    void rejectsUnknownTeacher() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createProject(request("P", 2, List.of(10L))))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(projectRepository, never()).save(any());
    }

    @Test
    void rejectsCreatorWhoIsNotATeacher() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(user(TEACHER_ID, "X", Role.STUDENT)));

        assertThatThrownBy(() -> service.createProject(request("P", 2, List.of(10L))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("teachers");
        verify(projectRepository, never()).save(any());
    }

    @Test
    void rejectsDuplicateStudentIds() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));

        assertThatThrownBy(() -> service.createProject(request("P", 2, List.of(10L, 10L))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("more than once");
    }

    @Test
    void rejectsUnknownStudentIds() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));
        when(userRepository.findAllById(Set.of(10L, 99L))).thenReturn(List.of(students.getFirst()));

        assertThatThrownBy(() -> service.createProject(request("P", 2, List.of(10L, 99L))))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void rejectsSelectedUsersWhoAreNotStudents() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));
        when(userRepository.findAllById(any())).thenReturn(List.of(students.getFirst(), teacher));

        assertThatThrownBy(() -> service.createProject(request("P", 2, List.of(10L, TEACHER_ID))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not students");
    }

    @Test
    void blankDescriptionIsStoredAsNull() {
        when(userRepository.findById(TEACHER_ID)).thenReturn(Optional.of(teacher));
        when(userRepository.findAllById(any())).thenReturn(students.subList(0, 1));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectDetailResponse result = service.createProject(
                new CreateProjectRequest("P", "   ", 2, TEACHER_ID, List.of(10L)));

        assertThat(result.description()).isNull();
    }

    @Test
    void getProjectThrowsWhenMissing() {
        when(projectRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProject(42L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("42");
    }

    private static CreateProjectRequest request(String name, int groupSize, List<Long> studentIds) {
        return new CreateProjectRequest(name, "desc", groupSize, TEACHER_ID, studentIds);
    }

    private static User user(long id, String name, Role role) {
        User user = new User(name, name.toLowerCase() + "@test", role);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
