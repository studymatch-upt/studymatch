# StudyMatch — Adaptive Student Group Formation

> Software Quality project · UPT · 2026/2027 · Team: Tomás, César, Aly

StudyMatch forms student work groups **automatically**, using what each student accumulates during the degree: grades, competencies, strengths and preferences. Instead of random groups or groups of friends, every group gets a balanced mix of the skills the activity needs.

---

## 1. The problem

Forming good groups by hand is slow and rarely fair. StudyMatch has to answer two questions:

1. **Who is each student?** — build a profile of competencies, even for students with no history yet (**cold start**).
2. **How do we combine students?** — use those profiles to form balanced groups for a specific activity (**matching**).

## 2. Users

| Role | What they do |
|---|---|
| **Student** | Registers, answers the onboarding questionnaire, records academic history, views their profile and their groups. |
| **Teacher** | Creates projects (grouping contexts) for their course units, sets group size and competency weights, generates and adjusts groups. |
| **Admin** | Manages users and roles, degrees, course units, the competency catalogue and the weight of each course unit in each competency. |

## 3. Business logic

### 3.1 Competencies

Every piece of information becomes a score from 0 to 100 in six categories (managed by the Admin, so more can be added):

**Programming · Mathematics and Logic · Databases · Design and UX · Communication and Writing · Organisation and Leadership**

### 3.2 Cold start — the onboarding questionnaire

New students have no grades. Right after registering they answer a questionnaire about **what they like and find easy**: 2 statements per competency on a 1–5 scale, plus their preferred role in a group (Leader, Developer, Designer, Tester, Writer).

```
Q(c) = ((a₁ + a₂) / 2 − 1) / 4 × 100
```

### 3.3 Academic evidence — grades

Each course unit contributes to competencies with a weight (e.g. **AED = 70% Programming + 30% Mathematics and Logic**). Only the latest attempt of each course unit counts.

```
G(c) = Σ (grade / 20 × 100 × weight) / Σ weight
```

### 3.4 The dynamic profile

The questionnaire matters most at the start and gives way to real evidence as the student completes course units — but never disappears, because soft skills are poorly captured by grades.

```
Score(c) = α × Q(c) + (1 − α) × G(c)          α = max(0.2, 1 − 0.1 × completed course units)
```

| Completed course units | 0 | 2 | 4 | 6 | 8+ |
|---|---|---|---|---|---|
| Questionnaire weight (α) | 100% | 80% | 60% | 40% | 20% |

The profile is recalculated whenever the questionnaire is submitted or a grade is recorded.

### 3.5 Matching — forming balanced groups

The teacher creates a **project** with a group size and the **weight of each competency** for that activity (e.g. a database project: 50% Databases, 30% Programming, 20% Communication).

1. **Weighted score** for each student: `S = Σ weight(c) × Score(c)`.
2. **Snake distribution:** students sorted by S are dealt 1-2-3, 3-2-1, 1-2-3… so strong and weaker students are spread evenly.
3. **Coverage:** every group should have someone strong (≥ 60) in each important competency (weight ≥ 25%); otherwise students with similar S are swapped between groups.
4. **Constraints and roles:** swaps also respect "must not be together" rules and avoid groups without a leader.
5. **Teacher review:** the teacher sees the proposal, adjusts it and publishes it.

The group size is a **maximum** and sizes differ by at most one (10 students, size 3 → 3/3/2/2).

### 3.6 Additional features

- **AI weight recommendation** — the teacher describes the activity and gets suggested competency weights (always confirmed by the teacher; no personal data is sent).
- **Match explanation** — "Why this group?": each student sees what they bring to the group.
- *(optional)* **Peer evaluation** — after a project, students rate their colleagues, which feeds the profile.

Full details: [use cases](docs/use-cases.md) · [cold start and matching](docs/cold-start-and-matching.md).

---

## 4. Technology stack

| Layer | Technology |
|---|---|
| Frontend | **React Native + Expo** (TypeScript) — Android, iOS and web |
| Backend | Java 21 + Spring Boot 4 (REST API, Spring Data JPA, Validation) |
| Database | MySQL 8.4 + Flyway migrations |
| Build | Maven (backend), npm (frontend) |
| Tests and quality | JUnit 5, Mockito, Spring Boot Test, H2, JaCoCo · Jest/Vitest, Testing Library, oxlint |

Justification: [docs/tech-stack.md](docs/tech-stack.md).

## 5. Current status (Sprint 1)

Working end-to-end flow: a teacher creates a project, picks the students and the maximum group size, and the groups are formed and stored automatically (no matching criteria yet — the balanced round-robin strategy is the base for the snake distribution above).

| Done | Next |
|---|---|
| Users with roles, projects, groups | Admin role and management screens |
| `POST/GET /api/projects`, `GET /api/users` | Login (Spring Security) |
| Group formation with balanced sizes | Questionnaire, competency profile, weighted matching |
| Unit + integration tests, coverage report | Frontend in Expo (current prototype is React + Vite) |

---

## 6. Run it locally

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

## 7. Tests and quality checks

| Command | Where | What |
|---|---|---|
| `mvn verify` | backend | Unit + integration tests (H2 in MySQL mode, same Flyway migrations), JaCoCo report in `target/site/jacoco/index.html` |
| `npm test` | frontend | Vitest + Testing Library |
| `npm run lint` | frontend | oxlint |
| `npm run build` | frontend | Type-check + production build |

## 8. Code structure

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

## 9. API

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

## 10. Design decisions

- **Matching criteria plug in via `GroupFormationStrategy`.** The questionnaire- and grade-based matching becomes a new implementation; `ProjectService` does not change. Strategies are deterministic, which keeps them testable.
- **Project and groups are created in one transaction.** Either everything is saved or nothing is.
- **Flyway owns the schema**, Hibernate only validates (`ddl-auto: validate`). Tests run the same migrations on H2.
- **No authentication yet.** `teacherId` in the request and the "Acting as" dropdown are placeholders until Spring Security is added.

## 11. Team workflow and documentation

Every change follows **Issue → Branch → Pull Request → Review → Merge** — see [CONTRIBUTING.md](CONTRIBUTING.md).

| Document | Content |
|---|---|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Workflow, conventions, review rotation, Definition of Done |
| [docs/tech-stack.md](docs/tech-stack.md) | Technology stack and justification |
| [docs/use-cases.md](docs/use-cases.md) | Use-case model |
| [docs/cold-start-and-matching.md](docs/cold-start-and-matching.md) | Cold start and matching (business logic) 