# InterviewIQ — Smart Interview Journal

InterviewIQ is a React and Spring Boot application for tracking job applications, interview questions, interview notes, and lessons learned. It includes JWT authentication, user-owned interview data, dashboards, and an admin area for user and application management.

## Features

- Create, search, filter, paginate, edit, view, and delete interviews.
- Track application dates, rounds, next-round dates, status, and feedback.
- Add questions with difficulty, answers, and revision notes.
- Add journal entries with experience, mistakes, learnings, and confidence scores.
- View user-scoped dashboard statistics.
- Follow a guided first-time onboarding flow with dashboard next actions.
- Save new interview drafts locally and resume them after leaving the form.
- Quickly add an interview with only the company, role, date, and current stage, then advance its progress from the dashboard or interview list.
- See all active interviews with a next-round date in dashboard reminders, including overdue, today, tomorrow, and upcoming labels.
- Copy a personalized, editable follow-up email template from an interview details page.
- Use an interview-specific Preparation Hub with a progress checklist, question and reflection counts, and quick links into the relevant workspace.
- Paste a job description into the Role Analyzer to detect common skills, focus areas, and practice prompts for that interview.
- Use responsive mobile navigation, client-side validation, accessible focus states, and clear success/error feedback.
- Use consistent inline/toast feedback instead of browser-native alerts, including helpful messages when a hosted backend is waking up.
- Register and sign in with BCrypt-hashed passwords and JWT sessions.
- Use admin-only dashboards and user management with role-based access control.
- Enforce interview ownership for normal users; admins can manage all interviews.

## Stack

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS, react-hot-toast
- Backend: Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA
- Authentication: JWT with JJWT and BCrypt
- Database: PostgreSQL
- API documentation: Springdoc OpenAPI / Swagger UI
- Operations: public `/health` liveness endpoint for Render and uptime monitors
- Deployment: Docker Compose with PostgreSQL, Spring Boot, and Nginx; Render and Neon free tiers for the current hosted deployment

## Repository audit

The deployment work is on the `codex/deployment` branch. The current authentication fix is `64bf61e` (`Fix hosted authentication`), based on the deployment preparation commit `c0f99e4`. Existing application and database records are not modified by the application startup configuration beyond Hibernate's existing `update` behavior.

## Configuration and secrets

The backend reads connection and security settings from environment variables. No real secret belongs in Git.

| Variable | Purpose | Local default |
| --- | --- | --- |
| `DATABASE_URL` | JDBC PostgreSQL URL | `jdbc:postgresql://localhost:5432/interviewjournal` |
| `DB_USERNAME` | PostgreSQL username | `injamam` |
| `DB_PASSWORD` | PostgreSQL password | empty for an existing passwordless local setup |
| `JWT_SECRET` | JWT signing key, Base64 or raw | required; at least 32 bytes |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `JPA_DDL_AUTO` | Hibernate schema behavior | `update` |
| `PORT` | Backend HTTP port | `8080` |

Generate a suitable local Base64 JWT secret with:

```bash
openssl rand -base64 32
```

The application also accepts a raw secret when it contains at least 32 bytes. Keep the value private and do not commit it.

For a production database, keep a backup and introduce a versioned migration process before changing `JPA_DDL_AUTO` to `validate`. Do not use `docker compose down -v`; the named PostgreSQL volume is the persistent application data store.

## Current hosted deployment

The current no-cost hosted deployment uses Render for the frontend and Spring Boot API, and Neon for PostgreSQL:

- Frontend: https://interviewiq-frontend-lcsp.onrender.com
- Backend: https://interviewiq-api-ggbi.onrender.com
- Database: Neon project `interviewiq-production`, Singapore region, free plan

Render keeps the backend on its free instance, which can sleep after inactivity. The first request after sleep may take approximately 50 seconds or more. Secrets are stored as private Render environment variables and are not committed to this repository. The frontend API URL is configured at build time through `VITE_API_URL`; the backend CORS setting must contain the exact frontend HTTPS origin.

For uptime monitoring, configure a free HTTPS monitor to request `https://interviewiq-api-ggbi.onrender.com/health`. A healthy response is a JSON payload with `"status": "UP"`; the endpoint intentionally exposes no database credentials, connection details, or environment values. Configure Render's web service health check path as `/health` if a service health check is enabled.

The hosted Neon database was created as a fresh production database and its schema was initialized by Hibernate with `JPA_DDL_AUTO=update`. Existing local PostgreSQL records have not been copied automatically. Before importing existing records, create and verify a backup, then use an explicit export/import or versioned migration process.

To add features after deployment, make the change on a branch, run the frontend and backend checks below, push the branch configured in Render, and trigger a new deploy. Keep database changes backward-compatible and migrate production data deliberately.

## Run locally without containers

### Requirements

- Java 21 or newer
- Node.js and npm
- PostgreSQL

Create the database if it does not exist:

```sql
CREATE DATABASE interviewjournal;
```

Set the backend variables in the shell that starts Spring Boot:

```bash
export DB_USERNAME='your_postgres_username'
export DB_PASSWORD='your_postgres_password'
export JWT_SECRET="$(openssl rand -base64 32)"
export CORS_ALLOWED_ORIGINS='http://localhost:5173'
```

Start the backend from the repository root:

```bash
./mvnw spring-boot:run
```

Start the frontend in a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

The frontend uses `VITE_API_URL` when set, otherwise it uses `http://localhost:8080`.

## Docker deployment

This repository includes a no-cost, self-hosted deployment definition. It runs PostgreSQL, the Spring Boot backend, and the built React app behind Nginx. It does not require a third-party hosting account or transmit data outside the machine running Docker.

1. Copy the example environment file and replace both secret values:

   ```bash
   cp .env.example .env
   openssl rand -base64 32
   ```

2. Set `POSTGRES_PASSWORD` and `JWT_SECRET` in `.env`. For a remote deployment, set `CORS_ALLOWED_ORIGINS` to the exact HTTPS frontend origin and `VITE_API_URL` to the HTTPS backend URL before building.

3. Build and start the services:

   ```bash
   docker compose up --build -d
   ```

4. Open:

   - Frontend: `http://localhost:4173`
   - Backend: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

5. Stop the services without removing database data:

   ```bash
   docker compose down
   ```

The Compose definition remains available for local or self-hosted deployment. The hosted Render/Neon deployment is separate and does not replace the Compose workflow.

## Testing

Run the frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

Run the backend test suite:

```bash
./mvnw test
```

The Spring context test uses an isolated H2 test profile, so it does not require or alter PostgreSQL. The end-to-end verification was run separately against an isolated PostgreSQL 18 cluster and covered:

- unauthenticated and malformed JWT requests returning `401`;
- registration, login, current-user lookup, and JWT-authenticated access;
- interview create/list/get/update/search;
- question and journal creation and retrieval;
- user ownership denial for another user;
- admin dashboard, user list, all-interviews list, and admin interview access;
- interview deletion with child question/journal records;
- user deletion when no interviews are owned.

The frontend browser smoke test verified that `/register` renders, password mismatch validation appears before submission, password visibility controls work, and its sign-in action reaches `/login`. The local frontend also verifies that a slow hosted API request displays a server-wake-up status and a friendly retry message after timeout.

Frontend production checks currently pass with `npm run lint` and `npm run build`. Backend tests use the isolated H2 profile; the test resources select Mockito's subclass mock maker so the suite remains runnable on JDKs that restrict dynamic agent attachment.

The hosted smoke test verified that the Render frontend serves the login page, the signup screen opens, the browser reports no frontend console errors, the backend starts successfully with a connection to Neon PostgreSQL, a synthetic account can register and log in, and an authenticated session can load the dashboard. Full admin actions require an admin account in the hosted database and should be exercised without sharing passwords in source control or chat.

The quick-add workflow keeps the existing full interview form available for detailed records. The dashboard and interview list provide one-click progress updates for Applied, Screening, Technical, HR, and Offer; each update preserves the existing interview notes and dates.
The dashboard reminder feed uses the authenticated `GET /interviews/upcoming` endpoint and excludes selected or rejected interviews. It is intentionally in-app and free; calendar export and optional email delivery can be added later without changing the existing interview model.

The Preparation Hub is available on each interview details page. Its five-step checklist is saved locally in the browser, while questions, reflections, interview progress, and dates continue to use the existing authenticated data flows. This keeps the feature backward-compatible and avoids a database migration.

The Role Analyzer saves a job description and its deterministic skill analysis in a separate preparation record for the interview. It requires no external AI provider or paid service; optional AI feedback can be layered on later without changing the existing interview records.

## API access rules

- `/auth/login` and `/auth/register` are public.
- `/users/me` is available to authenticated users.
- `/interviews/upcoming` returns the authenticated user's active interviews with next-round dates, ordered from soonest to latest; admins receive all active interviews.
- `/interviews/{id}/coach/profile` returns or saves the authenticated user's job description analysis; admins can access all interview preparation records.
- `/users/**` and `/interviews/all` are admin-only.
- Normal users can access only their own interviews and related questions/journal entries.
- Admins can view and manage all interviews and related records.
- Swagger and OpenAPI documentation are public.

## Project layout

```text
.
├── frontend/                         # React/Vite client and Nginx image
├── src/main/java/                    # Spring Boot application
├── src/main/resources/               # Runtime configuration
├── src/test/                         # Isolated backend tests
├── Dockerfile                        # Backend image
├── docker-compose.yml                # Database/backend/frontend deployment
├── .env.example                      # Non-secret configuration template
└── pom.xml
```

## Data-safety notes

- Secrets are supplied through environment variables and ignored `.env` files.
- Hibernate remains on `update` by default for compatibility with the current project; back up PostgreSQL before upgrades.
- Deleting an interview intentionally deletes its questions and journal entries because they belong to that interview.
- Deleting a user who owns interviews is rejected so existing interview data is not orphaned or removed implicitly.
