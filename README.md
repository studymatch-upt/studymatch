# Group Matcher

Web app for forming student project groups. Spring Boot (Maven, MySQL) backend + React (Vite, TypeScript) frontend.

Current end-to-end flow: a teacher creates a project, picks the students and the number of students per group, and the groups are formed automatically (no matching criteria yet).

## Run it locally

Requirements: JDK 21+, Maven 3.9+, Node 20+, Docker (or your own MySQL 8).

```bash
# 1. Database
docker compose up -d

# 2. Backend  -> http://localhost:8080
cd backend
mvn spring-boot:run

# 3. Frontend -> http://localhost:5173  (proxies /api to :8080)
cd frontend
npm install
npm run dev
```

On first start Flyway creates the schema and seeds two teachers and twelve students (`backend/src/main/resources/db/seed`). Database connection can be overridden with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

## Tests and quality checks

| Command | Where | What |
|---|---|---|
| `mvn verify` | backend | Unit + integration tests (H2 in MySQL mode, same Flyway migrations), JaCoCo report in `target/site/jacoco/index.html` |
| `npm test` | frontend | Vitest + Testing Library |
| `npm run lint` | frontend | oxlint |
| `npm run build` | frontend | Type-check + production build |

## Structure

```
backend/src/main/java/com/qs/groupmatcher
├── controller/        REST endpoints (HTTP in/out only)
├── service/           Use cases and business rules, transaction boundaries
│   └── grouping/      GroupFormationStrategy: the extension point for matching criteria
├── repository/        Spring Data JPA
├── model/             JPA entities: User, Project, ProjectGroup
├── dto/               Request/response records (entities never leave the service layer)
└── exception/         Domain exceptions + RFC 9457 problem-detail handler

frontend/src
├── api/               fetch wrapper (ApiError), endpoint functions, useApi hook
├── context/           Current teacher (stand-in for login)
├── components/        Layout
└── pages/             Project list, create project, project detail
```

The "view" in MVC is the React app; the backend exposes JSON.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/users?role=TEACHER\|STUDENT` | List users by role |
| POST | `/api/projects` | Create project and form groups. Returns 201 + `Location` |
| GET | `/api/projects?teacherId={id}` | Teacher's projects with group/student counts |
| GET | `/api/projects/{id}` | Project with groups and members |

`POST /api/projects` body:

```json
{ "name": "Web App", "description": "optional", "groupSize": 3, "teacherId": 1, "studentIds": [3, 4, 5, 6, 7] }
```

Errors are `application/problem+json`: 400 (validation, with `fieldErrors`), 404 (unknown teacher/student/project), 422 (business rule, e.g. creator is not a teacher or a selected user is not a student).

## Design decisions

- **Group size is a maximum, groups are balanced.** The strategy uses the fewest groups that respect the size and deals students round-robin, so sizes differ by at most one: 10 students with size 3 gives 3/3/2/2, not 3/3/3/1. The only way to get a group of one is size 2 with an odd number of students (or size 1). If you'd rather treat the size as a target (10 / 3 → 4/3/3), that is a change to one class.
- **Matching criteria plug in via `GroupFormationStrategy`.** Grades, strengths, etc. become new implementations; `ProjectService` does not change. The current one is deterministic (input order), which keeps it testable.
- **Project and groups are created in one transaction.** Either everything is saved or nothing is.
- **Flyway owns the schema**, Hibernate only validates (`ddl-auto: validate`). Tests run the same migrations on H2.
- **No authentication yet.** `teacherId` in the request and the "Acting as" dropdown are placeholders; with Spring Security the teacher comes from the logged-in user and the field is removed.

## Next steps

- Spring Security (login, roles), then drop `teacherId` from the request
- Student profile data (grades, strengths) and a criteria-based `GroupFormationStrategy`
- Regenerate / manually adjust groups
- Remove `db/seed` from Flyway locations for non-dev environments
