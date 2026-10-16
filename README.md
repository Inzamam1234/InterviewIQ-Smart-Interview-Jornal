# InterviewIQ — Smart Interview Journal

InterviewIQ is a React and Spring Boot application for tracking job applications, interview questions, interview notes, and lessons learned. It includes JWT authentication, user-owned interview data, dashboards, and an admin area for user and application management.

## Features

- Create, search, filter, paginate, edit, view, and delete interviews.
- Track application dates, rounds, next-round dates, status, and feedback.
- Add questions with difficulty, answers, and revision notes.
- Add journal entries with experience, mistakes, learnings, and confidence scores.
- View user-scoped dashboard statistics.
- Register and sign in with BCrypt-hashed passwords and JWT sessions.
- Use admin-only dashboards and user management with role-based access control.
- Enforce interview ownership for normal users; admins can manage all interviews.

## Stack

- Frontend: React 19, Vite, React Router, Axios, Tailwind CSS, react-hot-toast
- Backend: Java 21, Spring Boot 3.5, Spring Security, Spring Data JPA
- Authentication: JWT with JJWT and BCrypt
- Database: PostgreSQL
- API documentation: Springdoc OpenAPI / Swagger UI
- Deployment: Docker Compose with PostgreSQL, Spring Boot, and Nginx

## Repository audit

The repository currently has three commits on `main`:

1. `b1a9d0d` — Initial InterviewIQ implementation
2. `6d37b82` — Add professional project README
3. `4926b82` — Update README with project overview

The working tree was clean at the start of the audit. Existing application and database records are not modified by the application startup configuration beyond Hibernate's existing `update` behavior.

## Configuration and secrets

The backend reads connection and security settings from environment variables. No real secret belongs in Git.

| Variable | Purpose | Local default |
| --- | --- | --- |
| `DATABASE_URL` | JDBC PostgreSQL URL | `jdbc:postgresql://localhost:5432/interviewjournal` |
| `DB_USERNAME` | PostgreSQL username | `injamam` |
| `DB_PASSWORD` | PostgreSQL password | empty for an existing passwordless local setup |
| `JWT_SECRET` | Base64-encoded JWT signing key | required; no default |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `JPA_DDL_AUTO` | Hibernate schema behavior | `update` |
| `PORT` | Backend HTTP port | `8080` |

Generate a suitable local JWT secret with:

```bash
openssl rand -base64 32
```

For a production database, keep a backup and introduce a versioned migration process before changing `JPA_DDL_AUTO` to `validate`. Do not use `docker compose down -v`; the named PostgreSQL volume is the persistent application data store.

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

The current workspace did not have a running Docker daemon, so the Compose deployment definition was validated statically but not started here. No paid service was selected or provisioned. Publishing to a cloud provider requires a provider choice and credentials; those should be supplied before any external deployment.

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

The frontend browser smoke test verified that `/register` renders and its sign-in action reaches `/login`.

## API access rules

- `/auth/login` and `/auth/register` are public.
- `/users/me` is available to authenticated users.
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
