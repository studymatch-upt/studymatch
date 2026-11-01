# Sprint 2 — Design Decisions (Student Profile & Cold Start)

This document records the main design decisions taken during Sprint 2 and the reasons behind them.

## 1. Scope

Sprint 2 builds the **student-profile subsystem**: student information, academic history, a competency profile and a cold-start strategy. Automatic group formation is out of scope (it was only prototyped in Sprint 1).

We prioritised one **small, complete and tested vertical slice** over many partial features:

```
Mobile app (Expo) → REST API (Spring Boot) → ProfileCalculator (business logic) → MySQL
```

## 2. Student information

| Attribute | Why |
|---|---|
| Name, email | Identify and contact the student |
| Student number | Unique institutional identifier |
| Curricular year | Gives context to the profile (a 1st-year student is expected to have little history) |

Students are users with the role `STUDENT` (table `app_user`), so the same entity can later log in.

## 3. Academic history model

```
CourseUnit ──< CourseUnitCompetency >── Competency (enum)
    │
    └──< Enrollment >── Student
```

| Concept | Decision | Why |
|---|---|---|
| **Course unit** | Code, name, year, semester | Enough to identify and order the units of the degree |
| **Course unit → competency** | Each course unit contributes to one or more competencies with a **weight** in ]0, 1] | A course unit is evidence of several skills, not of only one (e.g. AED is mostly programming but also logic) |
| **Enrollment** | Student, course unit, academic year, **attempt number**, grade 0–20 | Represents repeated course units and grade improvements |
| **Latest attempt rule** | Only the most recent attempt of each course unit counts | The current grade is the best evidence of the current competence; an old failed attempt should not penalise a student who later passed |

In the review meeting (19 Oct), the teacher suggested using the **average of all attempts** instead of only the latest one. It is recorded as an Issue for the next sprint, because it changes the calculation and the expected values of several tests.

## 4. Competency model

Six competencies, defined in the `Competency` enum:

| Competency | Covers |
|---|---|
| `PROGRAMMING` | Writing code, debugging |
| `MATHEMATICS_AND_LOGIC` | Reasoning, algorithms, calculus |
| `DATABASES` | Data modelling, SQL |
| `DESIGN_AND_UX` | Interfaces, visual design |
| `COMMUNICATION` | Reports, presentations |
| `ORGANISATION_AND_LEADERSHIP` | Planning, coordination, deadlines |

**Why an enum and not a database table:** the list is small and stable during the Sprint, and an enum makes the business logic type-safe and easy to test. Making competencies configurable by the Admin is planned as a future improvement; the rest of the model already stores competencies by name, so the change is contained.

## 5. Profile calculation

Implemented in `ProfileCalculator` (pure Java, no database, fully unit tested).

```
Q(c)     = (answer − 1) / 4 × 100                                  questionnaire score, 0–100
G(c)     = Σ (grade / 20 × 100 × weight) / Σ weight                academic score, 0–100
α        = max(0.2, 1 − 0.1 × evaluated course units)              weight of the questionnaire
Score(c) = α × Q(c) + (1 − α) × G(c)
```

**Evaluated course units** are the course units with a grade, counting only the latest attempt of each one, **whether passed or failed**. A failed grade is also academic evidence: if it did not reduce α, a student who answered 5 for Programming and failed AED with 6 would keep a Programming score of 100, as if the failure had never happened (with the rule above the score is 93).

**Worked example** — a student answered 3 for Programming and has AED = 16 (weight 0.7) and Mobile Lab = 14 (weight 0.6):

- Q = (3 − 1) / 4 × 100 = **50**
- G = (80 × 0.7 + 70 × 0.6) / 1.3 = **75.4**
- 2 course units → α = **0.8**
- Score = 0.8 × 50 + 0.2 × 75.4 = **55.1**

### How the profile is updated

The profile is **not stored**: it is calculated every time it is requested, from the current questionnaire answers and grades. Adding a grade therefore updates the profile immediately and can never leave it out of date.

### How missing information is handled

| Situation | Result |
|---|---|
| Questionnaire and grades for a competency | Weighted combination (α) |
| Only questionnaire | Questionnaire score |
| Only grades | Academic score |
| Neither | Competency is **unknown** (not shown as 0, which would be misleading) |
| Invalid data (answer outside 1–5, grade outside 0–20, weight outside ]0, 1]) | Rejected with an error |

## 6. Cold-start strategy

**Question:** how can StudyMatch build a useful profile when there is no academic history?

**Answer: a short self-assessment questionnaire** answered on a 1–5 scale (1 = strongly disagree, 5 = strongly agree).

- The mobile app asks **18 statements, 3 per competency**, in 6 steps. Example for Programming: *"Sinto-me à vontade a escrever código para resolver problemas."*
- The 3 answers of a competency are averaged and rounded (e.g. 4, 4, 5 → 4.33 → **4**), so the API and the `ProfileCalculator` receive **one value from 1 to 5 per competency**.

| Decision | Why |
|---|---|
| Self-assessment | Available from day one, quick (about 2 minutes), and covers soft skills that grades do not measure |
| Three statements per competency | One statement is easy to misread; three different angles give a more reliable answer, and the API contract stays simple (one value per competency) |
| α starts at 1.0 | With no grades, the questionnaire is the only evidence |
| α decreases 0.1 per evaluated course unit | Self-reported data is less reliable than observed results, so its influence shrinks as evidence accumulates |
| α never goes below 0.2 | Communication and leadership are poorly captured by grades; the student's own view keeps some weight |

| Evaluated course units | 0 | 2 | 4 | 6 | 8+ |
|---|---|---|---|---|---|
| Questionnaire weight (α) | 100% | 80% | 60% | 40% | 20% |

## 7. Team-defined feature: profile origin indicator and radar

In the mobile app, the competency screen shows:

- a **radar chart** and **bars** with the six competencies;
- **"Origem do perfil"**: a split bar such as *"Questionário · 70% · Notas · 30%"*.

The two percentages are α and 1 − α, that is, **the weight of each source in the calculation**. They do not measure how accurate or reliable the profile is; they show how much of it is based on the student's self-assessment and how much on academic results.

**Why it adds value:** the profile becomes explainable. Teachers can see how much of a profile is self-reported, and students understand why their profile changes when new grades are added. It also prepares the "match explanation" feature planned for group formation.

## 8. Demo data

### Course units and competency weights

| Code | Course unit | Year/Sem. | Competency weights |
|---|---|---|---|
| `AM` | Análise Matemática | 1/1 | MATHEMATICS_AND_LOGIC 1.0 |
| `AED` | Algoritmos e Estruturas de Dados | 1/1 | PROGRAMMING 0.7 · MATHEMATICS_AND_LOGIC 0.3 |
| `BD` | Bases de Dados | 1/2 | DATABASES 0.8 · PROGRAMMING 0.2 |
| `LAM` | Laboratório de Aplicações Móveis | 2/1 | PROGRAMMING 0.6 · DESIGN_AND_UX 0.4 |
| `QS` | Qualidade de Software | 2/1 | PROGRAMMING 0.5 · ORGANISATION_AND_LEADERSHIP 0.3 · COMMUNICATION 0.2 |
| `GP` | Gestão de Projetos | 2/1 | ORGANISATION_AND_LEADERSHIP 0.6 · COMMUNICATION 0.4 |

### Demo students

We reuse two of the students already seeded in Sprint 1 and give them academic data:

| Student | Purpose | Data |
|---|---|---|
| **Carla Mendes** | Scenario A — student with history | Questionnaire: all 3 · Grades: AM 14, AED 1st attempt 8 → 2nd attempt 16, BD 17 |
| **Diogo Ferreira** | Scenario B — cold start | Questionnaire only: PROGRAMMING 4, MATHEMATICS_AND_LOGIC 2, DATABASES 3, DESIGN_AND_UX 5, COMMUNICATION 4, ORGANISATION_AND_LEADERSHIP 3 · no grades |

The data is loaded on startup by `DemoAcademicDataSeeder` (it only adds what is missing). The other seeded students have no academic data yet, so they show how the application represents a student with no information at all (every competency unknown). During the demo a grade can be added to Diogo to show the transition from cold start to academic evidence.

| Student | Questionnaire weight | Programming | Mathematics and Logic | Databases | Others |
|---|---|---|---|---|---|
| Carla | 70% (3 course units) | 59.33 | 56.69 | 60.5 | 50 |
| Diogo | 100% (no grades) | 75 | 25 | 50 | Design 100 · Communication 75 · Organisation 50 |
| Diogo + AED 14 | 90% | 74.5 | 29.5 | 50 | unchanged |

## 9. Testing strategy

`ProfileCalculatorTest` (JUnit 5 + AssertJ, 31 test runs) covers the minimum expectations of the Sprint:

| Expectation | Example test |
|---|---|
| Normal scenario | Questionnaire + two course units → expected score |
| Invalid / exceptional | Answer 6, grade 25, weight 0, attempt 0 → rejected |
| Boundary condition | 8, 9 or 20 course units → α stays at 0.2; answers 1 and 5; grades 0 and 20 |
| Student-profile rule | Only the latest attempt counts; profile changes when a grade is added |
| Cold-start rule | No grades → profile equals the questionnaire; α decreases 0.1 per course unit |

The rest of the suite:

| Level | What | Tests |
|---|---|---|
| Unit | Services and entities, with Mockito where a repository is needed (students, course units, enrollments, questionnaire, profile service, group formation) | 84 in total, including the 31 above |
| Integration | REST API with MockMvc on H2 (MySQL mode): create/list students, grades with attempts, profile endpoint, demo seeder | 30 |
| Mobile | Questionnaire aggregation, profile selection, grade validation, API client with mocked responses (Node test runner) | 15 |

Run with `./mvnw clean test` in `backend/` (114 tests).

## 10. Not done in this Sprint (next steps)

| Item | Reason / plan |
|---|---|
| Average of all attempts | Teacher's suggestion (19 Oct); changes the calculation and several tests — Issue for the next sprint |
| Send the app questionnaire to the API | Today the 18 answers stay on the device; the API (`PUT /questionnaire`) is ready |
| Login and roles | Agreed with the teacher to leave it for a later sprint; the app enters through a demo-students panel |
| Configurable parameters and questionnaire in the database | Scale, α parameters and statements are fixed in code — Issue #13 |
| Single schema mechanism | Sprint 1 tables come from Flyway and Sprint 2 tables from Hibernate (`ddl-auto: update`); next sprint Flyway is removed and Hibernate creates the whole schema |
| Delete student | Not needed for the demo |
| Weighted group formation | Out of Sprint 2 scope; the profile is the input it needs |
| Collaboration history | Suggested in review (#3); to be discussed with the teacher |