package com.qs.groupmatcher.seed;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Seeds the demo academic data on startup; off with app.seed.demo-academic-data=false. */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "demo-academic-data", havingValue = "true",
        matchIfMissing = true)
public class DemoAcademicDataRunner implements ApplicationRunner {

    private final DemoAcademicDataSeeder seeder;

    public DemoAcademicDataRunner(DemoAcademicDataSeeder seeder) {
        this.seeder = seeder;
    }

    @Override
    public void run(ApplicationArguments args) {
        seeder.seed();
    }
}
