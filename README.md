# StudyMatch — Adaptive Student Group Formation

> Software Quality project · UPT · 2026/2027 · Team: Tomás Silva 50959, Alykhan Jamal 50475, César Almeida 47887

StudyMatch forms student work groups **automatically**, using what each student accumulates during the degree: grades, competencies, strengths and preferences. Instead of random groups or groups of friends, every group gets a balanced mix of the skills the activity needs.

---

## 1. The problem

Forming good groups by hand is slow and rarely fair. StudyMatch has to answer two questions:

1. **Who is each student?** — build a profile of competencies, even for students with no history yet (**cold start**).
2. **How do we combine students?** — use those profiles to form balanced groups for a specific activity (**matching**).

Sprint 2 answers the first question. Matching is the goal of the next sprints.

## 2. Users

| Role | What they do |
|---|---|
| **Student** | Answers the onboarding questionnaire, records academic history, views their competency profile and their groups. |
| **Teacher** | Creates projects (grouping contexts) for their course units, sets group size and competency weights, generates and adjusts groups. |
| **Admin** | Manages users and roles, course units, the competency catalogue and the weight of each course unit in each competency. |

## 3. Business logic

### 3.1 Competencies

Every piece of information becomes a score from 0 to 100 in six competencies:

**Programming · Mathematics and Logic · Databases · Design and UX · Communication · Organisation and Leadership**

They are defined in the `Competency` enum (backend). Making them configurable by the Admin is planned (Issue #13).

### 3.2 Cold start — the onboarding questionnaire

New students have no grades, so the first profile comes from a **self-assessment questionnaire** on a 1–5 scale (1 = strongly disagree, 5 = strongly agree).

- The mobile app asks **18 statements, 3 per competency**, grouped in 6 steps.
- The 3 answers of each competency are averaged and rounded, so the backend receives **one value from 1 to 5 per competency**.

```
Q(c) = (answer − 1) / 4 × 100
```

### 3.3 Academic evidence — grades

Each course unit contributes to one or more competencies with a weight in ]0, 1] (e.g. **AED = 0.7 Programming + 0.3 Mathematics and Logic**). When a course unit is repeated, only the **latest attempt** counts.

```
G(c) = Σ (grade / 20 × 100 × weight) / Σ weight
```

### 3.4 The dynamic profile

The questionnaire matters most at the start and gives way to real evidence as the student is evaluated in more course units — but never disappears, because soft skills are poorly captured by grades.

```
Score(c) = α × Q(c) + (1 − α) × G(c)          α = max(0.2, 1 − 0.1 × evaluated course units)
```

| Evaluated course units | 0 | 2 | 4 | 6 | 8+ |
|---|---|---|---|---|---|
| Questionnaire weight (α) | 100% | 80% | 60% | 40% | 20% |

- **Evaluated course units** are the course units with a grade (latest attempt), **passed or failed**: a failed grade is also evidence.
- When only one source exists for a competency, that source is used alone; with neither, the competency is **unknown** (not shown as 0).
- The profile is **not stored**: it is recalculated on every request, so a new grade updates it immediately.

Details and a worked example: [docs/sprint2-design-decisions.md](docs/sprint2-design-decisions.md).

### 3.5 Matching — forming balanced groups (planned)

The teacher creates a **project** with a group size and the **weight of each competency** for that activity (e.g. a database project: 50% Databases, 30% Programming, 20% Communication).

1. **Weighted score** for each student: `S = Σ weight(c) × Score(c)`.
2. **Snake distribution:** students sorted by S are dealt 1-2-3, 3-2-1, 1-2-3… so strong and weaker students are spread evenly.
3. **Coverage:** every group should have someone strong (≥ 60) in each important competency (weight ≥ 25%); otherwise students with similar S are swapped between groups.
4. **Teacher review:** the teacher sees the proposal, adjusts it and publishes it.

The group size is a **maximum** and sizes differ by at most one (10 students, size 3 → 3/3/2/2). Sprint 1 already forms groups with balanced sizes (round-robin), the base for the snake distribution.

### 3.6 Additional features

- **Visual competency profile** *(done in Sprint 2)* — radar chart and bars of the six competencies.
- **Profile origin indicator** *(done in Sprint 2, team-defined feature)* — shows how much of the profile comes from the questionnaire and how much from grades (α and 1 − α).
- **Match explanation** *(planned)* — "Why this group?": each student sees what they bring to the group.
- **AI weight recommendation** *(planned)* — the teacher describes the activity and gets suggested competency weights, always confirmed by the teacher.
- **Availability and peer evaluation** *(planned)*.

---

## 4. Technology stack

| Layer | Technology |
|---|---|
| Mobile app | **React Native + Expo** (TypeScript), Expo Router |
| Web prototype (Sprint 1) | React + Vite (`frontend/`) |
| Backend | Java 21 + Spring Boot 4 (REST API, Spring Data JPA, Bean Validation) |
| Database | MySQL 8.4 (Docker Compose) · Flyway for the Sprint 1 schema and demo users |
| Build | Maven with Maven Wrapper (`mvnw`), npm |
| Tests and quality | JUnit 5, AssertJ, Mockito, Spring Boot Test (MockMvc), H2 in MySQL mode, JaCoCo · Node test runner, TypeScript, ESLint |

Why these choices:

- **Java + Spring Boot** — Java is required by the course; Spring Boot gives REST, persistence and validation out of the box, and a layered structure that is easy to test.
- **Expo** — students use the app mostly on their phone; one code base for Android and iOS, tested on a real device with Expo Go / a development build.
- **MySQL** — the domain is relational (students, course units, enrollments, answers); the team already knows it.
- **Maven Wrapper** — everyone builds with the same Maven version (`./mvnw`), without installing Maven.
- **Business logic in plain Java** (`ProfileCalculator`, `GroupFormationStrategy`) — unit-tested without database or web layer.

## 5. Current status (Sprint 2)

| Done | Next |
|---|---|
| Student information: create, list (search, filter, sort), view, update | Delete student |
| Academic history: course units with competency weights, grades with repeated attempts | Average of all attempts (teacher's suggestion, 19 Oct) |
| Cold-start questionnaire (18 statements in the app, 6 values in the API) | Send the app questionnaire to the API (today it stays on the device) |
| Competency profile (`ProfileCalculator`) and `GET /api/students/{id}/profile` | Configurable parameters and questionnaire in the database (#13) |
| Mobile app: demo students (Carla, Diogo), profile radar and bars, origin indicator, add grade | Login and roles (Spring Security) |
| 114 backend tests + 15 mobile tests, all passing | Remove Flyway: Hibernate creates the whole schema, demo users move to the seeder · weighted matching |

Demo data (loaded on startup): six course units (AM, AED, BD, LAM, QS, GP) and two demo students — **Carla Mendes** (questionnaire + grades, scenario A) and **Diogo Ferreira** (questionnaire only, cold start, scenario B).

---

## 6. Run it locally

Requirements: JDK 21+, Node 22.13+, Docker (or your own MySQL 8). Maven is not needed (Maven Wrapper).

```bash
# 1. Database
docker compose up -d

# 2. Backend  -> http://localhost:8080
cd backend
./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run

# 3. Mobile app
cd mobile
npm ci
npm start
```

To use the app on a phone with the real backend, set `EXPO_PUBLIC_STUDYMATCH_API_URL` to the laptop address on the same network (e.g. `http://192.168.1.20:8080`, **not** `localhost`). See [mobile/README.md](mobile/README.md).

On first start, Flyway creates the Sprint 1 schema and seeds two teachers and twelve students; Hibernate creates the Sprint 2 tables; the demo seeder adds the course units and the data of Carla and Diogo. The connection can be overridden with `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

## 7. Tests and quality checks

| Command | Where | What |
|---|---|---|
| `./mvnw clean test` | backend | 114 tests: unit (business logic, services) + integration (REST API with MockMvc on H2) |
| `./mvnw verify` | backend | Tests + JaCoCo coverage report in `target/site/jacoco/index.html` |
| `node --experimental-strip-types --test src/features/student/*.test.mjs` | mobile | 15 tests: questionnaire, profile, grades, API client |
| `npm run typecheck` · `npm run lint` | mobile | TypeScript and ESLint |

## 8. Code structure

```
backend/src/main/java/com/qs/groupmatcher
├── controller/        REST endpoints (HTTP in/out only)
├── service/           Use cases and business rules, transaction boundaries
│   ├── profile/       ProfileCalculator, Competency, GradeEvidence, StudentProfile (pure Java)
│   └── grouping/      GroupFormationStrategy: the extension point for matching criteria
├── repository/        Spring Data JPA
├── model/             JPA entities: User, CourseUnit, Enrollment, QuestionnaireAnswer, Project, ProjectGroup
├── dto/               Request/response records (entities never leave the service layer)
├── seed/              Demo academic data (course units, Carla, Diogo)
└── exception/         Domain exceptions + RFC 9457 problem-detail handler

mobile/src
├── app/               Screens (Expo Router): entry, login, student tabs, questionnaire, competencies, grades
├── features/student/  API client, questionnaire, profile selection, grades + their tests
├── components/        Design system components
└── theme/             Colours, tokens, light/dark theme
```

## 9. API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/users?role=TEACHER\|STUDENT` | List users by role |
| POST · GET | `/api/students` | Create a student · list (`search`, `curricularYear`, `sortBy`, `direction`) |
| GET · PUT | `/api/students/{id}` | View · update a student |
| POST · GET | `/api/course-units` | Create a course unit with competency weights · list |
| GET | `/api/course-units/{id}` | View a course unit |
| POST · GET | `/api/students/{id}/enrollments` | Add a grade (course unit, academic year, attempt, grade) · academic history |
| PUT · DELETE | `/api/students/{id}/enrollments/{enrollmentId}` | Correct a grade · remove it |
| PUT · GET | `/api/students/{id}/questionnaire` | Replace · read the questionnaire answers (1–5 per competency) |
| GET | `/api/students/{id}/profile` | Competency profile, questionnaire and academic weights |
| POST · GET | `/api/projects` | Create a project and form groups · teacher's projects (Sprint 1) |
| GET | `/api/projects/{id}` | Project with groups and members (Sprint 1) |

`GET /api/students/{id}/profile` response:

```json
{
  "studentId": 7,
  "scores": { "PROGRAMMING": 59.33, "MATHEMATICS_AND_LOGIC": 56.69, "DATABASES": 60.5 },
  "unknownCompetencies": [],
  "questionnaireWeight": 0.7,
  "academicWeight": 0.3,
  "completedCourseUnits": 3
}
```

Errors are `application/problem+json`: 400 (validation, with `fieldErrors`), 404 (unknown student, course unit or enrollment), 409 (duplicate, e.g. the same attempt twice), 422 (business rule).

## 10. Design decisions

- **The profile calculation is pure Java** (`ProfileCalculator`): no database and no web layer, so every rule is unit-tested in isolation.
- **The profile is calculated on request, not stored** — it can never be out of date.
- **Matching criteria plug in via `GroupFormationStrategy`.** The weighted matching becomes a new implementation; `ProjectService` does not change.
- **Schema:** tables are created by Hibernate (`ddl-auto: update`) from the entities. Sprint 1 tables still come from Flyway; next sprint Flyway is removed and the demo users move to the Java seeder, so Hibernate becomes the only mechanism.
- **No authentication yet** (agreed with the teacher). The app enters through a development panel with the demo students; login comes with Spring Security in a later sprint.

More: [docs/sprint2-design-decisions.md](docs/sprint2-design-decisions.md).

## 11. Team workflow

Every change follows **Issue → Branch → Pull Request → Review → Merge** — see [CONTRIBUTING.md](CONTRIBUTING.md) for the conventions, review rotation and Definition of Done.