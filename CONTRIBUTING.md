# Team Workflow and Conventions

How our team (Tomás, César, Aly) works on the repository

## 1. Development flow

```
Issue → Branch → Commits → Pull Request → Review → Merge
```

1. **Every piece of work starts with an Issue**: what to do, acceptance criteria, assignee, label and the Sprint milestone
2. A branch is created **from `main`** following the naming convention below.
3. Work is committed on the branch. Changes reach `main` only through a Pull Request.
4. A Pull Request is opened and linked to the Issue (`Closes #<number>` in the description)
5. **Another team member** reviews it, runs it when needed, and approves or asks for changes. Nobody approves their own PR
6. After approval, the PR is merged and the Issue closes automatically.

Issues and Pull Requests share the same numbering in GitHub, which is why a PR number is usually the Issue number plus one.

## 2. Issues

- Clear title: `Add student profile calculation`, `Document Sprint 2 design decisions`.
- Description with **acceptance criteria** (checklist), a **label** (`enhancement`, `documentation`, `bug`), the **Sprint milestone** and an **assignee**.
- Large tasks are split into Issues that can be finished in one or two days.
- Ideas for later sprints are also recorded as Issues 

## 3. Branch naming



| Type | Use |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `docs/` | Documentation |
| `chore/` | Setup and configuration |
| `test/` | Tests only |

Examples: `feature/4-profile-calculation`, `chore/6-maven-wrapper`, `docs/8-sprint2-design-decisions`.

## 4. Commits

[Conventional Commits](https://www.conventionalcommits.org/), in English:

```
<type>(<scope>): <short description> (#<issue>)
```

- `feat(backend): add student profile calculation with unit tests (#4)`
- `chore(backend): add Maven Wrapper (#6)`
- `docs: add Sprint 2 design decisions (#8)`
- `feat(mobile): add academic grades screen (#35)`

## 5. Pull Requests and reviews

- Small PRs focused on one Issue; the project must build and the tests must pass before asking for a review
- Description: what changed, how it was tested, `Closes #<issue>`
- When one PR depends on another, it may target the previous branch (**stacked PRs**) so each one shows only its own changes. Before merging, its base is changed to `main`

### Review rotation

| Author | Reviewer |
|---|---|
| Aly | César |
| César | Tomás |
| Tomás | Aly |

If the default reviewer is unavailable close to a deadline, the third member reviews.

The reviewer checks: are the acceptance criteria met? Do the tests pass (run them locally for code changes)? Is the code readable and does it follow these conventions? Comments are **specific and constructive** — questions are welcome (e.g. *"are failed course units counted in α?"*).

### Merging

- **Squash and merge** by default: one clean commit per PR on `main`.
- **Create a merge commit** for stacked PRs, so the commits of the previous PR are recognised and no conflicts appear.

## 6. Coding conventions

### General

- Code, identifiers and comments in **English**; text shown to users in **Portuguese**.
- No commented-out code, unused imports or secrets in the repository (`.env.local` files are ignored by Git).

### Backend (Java / Spring Boot)

- Standard Java conventions: 4-space indentation, braces always used, `PascalCase` classes, `camelCase` methods and variables, `UPPER_SNAKE_CASE` constants.
- Layers: `controller` (HTTP only) → `service` (business rules, transactions) → `repository` → `model`; `dto` records at the API boundary — entities never leave the service layer.
- Business rules live in `service`, never in controllers. Pure calculations (e.g. `ProfileCalculator`) do not depend on Spring or the database.
- REST endpoints under `/api`, plural nouns: `GET /api/students/{id}/profile`.
- Errors as `application/problem+json` (RFC 9457).

### Mobile (React Native + Expo, TypeScript)

- Screens in `src/app/` (Expo Router), feature logic in `src/features/`, shared components in `src/components/`, theme in `src/theme/`.
- All HTTP calls go through the API client (`studentApi.ts`), never directly from screens.

## 7. Definition of Done

An Issue is **Done** when:

- [ ] All acceptance criteria are met.
- [ ] New business logic has unit tests (normal case, invalid input, boundary values, business rules).
- [ ] `./mvnw clean test` (backend) and the mobile checks pass.
- [ ] A PR linked to the Issue was reviewed and approved by **another** member, and its comments were answered.
- [ ] Relevant documentation (README, `docs/`) was updated.
- [ ] The PR was merged into `main` and the Issue is closed.