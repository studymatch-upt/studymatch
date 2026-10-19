package com.qs.groupmatcher.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import com.qs.groupmatcher.model.Role;
import com.qs.groupmatcher.model.User;
import com.qs.groupmatcher.repository.CourseUnitRepository;
import com.qs.groupmatcher.repository.EnrollmentRepository;
import com.qs.groupmatcher.repository.UserRepository;
import com.qs.groupmatcher.service.StudentProfileService;
import com.qs.groupmatcher.service.profile.Competency;
import com.qs.groupmatcher.service.profile.StudentProfile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DemoAcademicDataSeederTest {

    @Autowired
    private DemoAcademicDataSeeder seeder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseUnitRepository courseUnitRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentProfileService profileService;

    private User student(String name) {
        return userRepository.findByRoleOrderByNameAsc(Role.STUDENT).stream()
                .filter(s -> name.equals(s.getName())).findFirst().orElseThrow();
    }

    @Test
    void seedsTheSixCourseUnitsAndTheTwoDemoProfiles() {
        seeder.seed();

        assertThat(courseUnitRepository.count()).isEqualTo(6);
        assertThat(courseUnitRepository.findByCode("QS")).isPresent();

        StudentProfile carla = profileService.profileOf(student("Carla Mendes").getId());
        assertThat(carla.completedCourseUnits()).isEqualTo(3);
        assertThat(carla.scoreOf(Competency.PROGRAMMING).getAsDouble()).isCloseTo(59.33, within(0.01));

        StudentProfile diogo = profileService.profileOf(student("Diogo Ferreira").getId());
        assertThat(diogo.completedCourseUnits()).isZero();
        assertThat(diogo.questionnaireWeight()).isEqualTo(1.0);
        assertThat(diogo.scoreOf(Competency.DESIGN_AND_UX).getAsDouble()).isCloseTo(100.0, within(0.01));
    }

    @Test
    void runningTheSeederTwiceDoesNotDuplicateAnything() {
        seeder.seed();
        long units = courseUnitRepository.count();
        long carlaResults = enrollmentRepository.countByStudentId(student("Carla Mendes").getId());

        seeder.seed();

        assertThat(courseUnitRepository.count()).isEqualTo(units);
        assertThat(enrollmentRepository.countByStudentId(student("Carla Mendes").getId())).isEqualTo(carlaResults);
        assertThat(carlaResults).isEqualTo(4);
    }
}
