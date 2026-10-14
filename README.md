# InterviewIQ --- Smart Interview Journal

InterviewIQ is a full-stack application for tracking job applications
and interviews, recording interview questions, and reflecting on
interview experiences. It includes a role-aware dashboard and
administration features.

> **Project status:** Development project. Deployment is not claimed to
> be complete.

## Table of Contents

-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Repository Structure](#repository-structure)
-   [Prerequisites](#prerequisites)
-   [Local Setup](#local-setup)
-   [Environment Configuration](#environment-configuration)
-   [API Overview](#api-overview)
-   [Authentication and
    Authorization](#authentication-and-authorization)
-   [Screenshots](#screenshots)
-   [Troubleshooting](#troubleshooting)
-   [Security Notes](#security-notes)
-   [Future Improvements](#future-improvements)

## Features

### Interview tracking

-   Create and manage interview records.
-   Record company, role, application date, current round, next-round
    date, feedback, and status.
-   View interview details and update or delete records.
-   Search and filter interview records by status and keyword.
-   Paginate interview results.

### Interview questions

-   Save questions associated with an interview.
-   Categorize questions by difficulty: Easy, Medium, or Hard.
-   Store answers and personal notes for later revision.

### Interview journal

-   Record interview experience, mistakes, and learnings.
-   Track a confidence level from 1 to 10.
-   Review reflections associated with an interview.

### Dashboard

-   View interview counts by status.
-   See total interview and question counts.
-   View average confidence level based on recorded journal entries.
-   Dashboard data is scoped according to the authenticated user's role.

### Administration

-   Admin dashboard with platform-level summaries.
-   User management, including viewing users and changing roles.
-   Admin-only access to administrative features.

### Authentication and security

-   Login using Spring Security authentication.
-   Password hashing with BCrypt.
-   JWT-based authentication for stateless API requests.
-   Role-based access control for `USER` and `ADMIN`.
-   Ownership checks to prevent users from accessing other users'
    interview data.
-   Request validation and centralized API exception handling.

## Technology Stack

  Layer               Technologies
  ------------------- ---------------------------------------
  Frontend            React, Vite, JavaScript, React Router
  API communication   Axios
  Notifications       `react-hot-toast`
  Backend             Java, Spring Boot
  Security            Spring Security, JWT, BCrypt
  Persistence         Spring Data JPA, Hibernate
  Database            PostgreSQL
  API documentation   Swagger UI / OpenAPI
  Build tools         Maven Wrapper, npm

## Architecture

``` text
React + Vite frontend
        |
        | HTTP requests with JWT bearer token
        v
Spring Boot REST API
        |
        +-- Spring Security / JWT filter
        +-- Controllers and request DTOs
        +-- Services and ownership checks
        +-- Spring Data JPA repositories
        |
        v
PostgreSQL database
```

The frontend communicates with the backend over HTTP. After login, the
frontend stores the returned JWT and sends it as a bearer token for
protected requests. Spring Security validates requests and applies role
and ownership rules before protected data is returned.

## Repository Structure

``` text
InterviewIQ-Smart-Interview-Jornal/
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── api/                      # Axios/API configuration
│   │   ├── components/               # Shared UI components
│   │   ├── context/                  # Frontend context
│   │   ├── layouts/                  # Page layouts
│   │   ├── pages/                    # Dashboard, interviews, journal, etc.
│   │   └── routes/                   # Application routes
│   ├── package.json
│   └── vite.config.js
├── src/main/java/com/injamam/interviewjournal/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── enums/
│   ├── exception/
│   ├── repository/
│   ├── security/
│   └── service/
├── src/main/resources/
│   └── application.properties
├── .gitignore
├── mvnw
├── mvnw.cmd
└── pom.xml
```

## Prerequisites

Install the following before running the application:

-   Java version compatible with the project's Maven/Spring Boot
    configuration.
-   PostgreSQL.
-   Node.js and npm.
-   Git (to clone the repository).

The project has been run locally with Spring Boot 3.5.x and Java 25.0.1.
If you use a different Java version, check the Maven compiler
configuration in `pom.xml`.

## Local Setup

### 1. Clone the repository

``` bash
git clone https://github.com/Inzamam1234/InterviewIQ-Smart-Interview-Jornal.git
cd InterviewIQ-Smart-Interview-Jornal
```

### 2. Create the PostgreSQL database

Create a PostgreSQL database named `interviewjournal`, or update the
JDBC URL in the backend configuration to match your database.

Example using `psql`:

``` sql
CREATE DATABASE interviewjournal;
```

Make sure the PostgreSQL user you configure has permission to connect to
this database.

### 3. Configure backend environment variables

The backend configuration expects these environment variables:

-   `DB_USERNAME` --- PostgreSQL username. Defaults to `injamam` if not
    set.
-   `DB_PASSWORD` --- PostgreSQL password. Defaults to an empty value if
    not set.
-   `JWT_SECRET` --- a strong secret used to sign JWTs. This must be
    set.

Generate a local JWT secret, for example:

``` bash
openssl rand -base64 32
```

Set the variables in the terminal where you will run Spring Boot. On
macOS/Linux, for example:

``` bash
export DB_USERNAME='your_postgres_username'
export DB_PASSWORD='your_postgres_password'
export JWT_SECRET='paste_your_generated_secret_here'
```

Use your actual local database credentials. Do not commit secrets to
Git.

### 4. Run the backend

From the repository root:

``` bash
./mvnw spring-boot:run
```

The backend is configured to use port `8080` by default. Keep the
environment variables available in the terminal session running the
backend.

### 5. Run the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite prints the local frontend URL in the terminal, commonly
`http://localhost:5173`.

The current Axios configuration uses `http://localhost:8080` as its
backend base URL. If your backend runs elsewhere, update the frontend
API configuration accordingly.

### 6. Open the application

Open the local URL printed by Vite. Ensure PostgreSQL and the Spring
Boot backend are running before testing API-backed features.

## Environment Configuration

The backend `src/main/resources/application.properties` should reference
environment variables rather than contain actual credentials. For
example:

``` properties
spring.application.name=interviewjournal

spring.datasource.url=jdbc:postgresql://localhost:5432/interviewjournal
spring.datasource.username=${DB_USERNAME:injamam}
spring.datasource.password=${DB_PASSWORD:}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

logging.level.org.springframework.security=INFO
```

This is an example of the expected local configuration. Keep any
project-specific settings already required by your local setup. Do not
put real passwords or JWT secrets in this file.

> **Note:** The current local frontend API configuration points directly
> to `http://localhost:8080`; a frontend API environment variable is not
> documented here because the current code has not been confirmed to
> read one.

## API Overview

The backend exposes REST endpoints under the paths below. Protected
endpoints require a valid JWT bearer token unless otherwise noted. Exact
request and response schemas should be checked in the source code or
Swagger UI.

  ---------------------------------------------------------------------------------------------
  Method                  Path                                          Purpose / access
  ----------------------- --------------------------------------------- -----------------------
  `POST`                  `/auth/login`                                 Authenticate and
                                                                        receive a JWT

  `GET`                   `/users/me`                                   Get the authenticated
                                                                        user's profile

  `POST`                  `/users`                                      Create a user

  `GET`                   `/users`                                      List users; admin
                                                                        access

  `GET`                   `/users/{id}`                                 Get a user by ID; admin
                                                                        access

  `PUT`                   `/users/{id}`                                 Update a user; admin
                                                                        access

  `DELETE`                `/users/{id}`                                 Delete a user; admin
                                                                        access, subject to
                                                                        server-side safeguards

  `POST`                  `/interviews`                                 Create an interview for
                                                                        the authenticated user

  `GET`                   `/interviews`                                 Get paginated
                                                                        interviews; supports
                                                                        `page` and `size`

  `GET`                   `/interviews/all`                             List all interviews;
                                                                        admin access

  `GET`                   `/interviews/{id}`                            Get an interview the
                                                                        caller is authorized to
                                                                        access

  `PUT`                   `/interviews/{id}`                            Update an interview the
                                                                        caller is authorized to
                                                                        access

  `DELETE`                `/interviews/{id}`                            Delete an interview the
                                                                        caller is authorized to
                                                                        access

  `GET`                   `/interviews/user/{userId}`                   Get interviews for a
                                                                        user, subject to
                                                                        ownership rules

  `GET`                   `/interviews/status/{status}`                 Filter interviews by
                                                                        status

  `GET`                   `/interviews/search`                          Search by `status` and
                                                                        `keyword` query
                                                                        parameters

  `POST`                  `/interviews/{interviewId}/questions`         Add a question to an
                                                                        authorized interview

  `GET`                   `/interviews/{interviewId}/questions`         List questions for an
                                                                        authorized interview

  `POST`                  `/interviews/{interviewId}/journal-entries`   Add a journal entry to
                                                                        an authorized interview

  `GET`                   `/interviews/{interviewId}/journal-entries`   List journal entries
                                                                        for an authorized
                                                                        interview

  `GET`                   `/dashboard`                                  Get dashboard
                                                                        statistics for the
                                                                        authenticated user or
                                                                        admin
  ---------------------------------------------------------------------------------------------

### Common query parameters

-   `GET /interviews?page=0&size=5` --- retrieve a page of interviews.
-   `GET /interviews/search?status=APPLIED&keyword=company` --- search
    interviews using a status and keyword.

Interview statuses currently include `APPLIED`, `IN_PROGRESS`,
`SELECTED`, and `REJECTED`. Question difficulty values are `EASY`,
`MEDIUM`, and `HARD`.

### Swagger / OpenAPI

When the backend is running locally, try:

-   Swagger UI: `http://localhost:8080/swagger-ui/index.html`
-   OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Use Swagger UI to inspect the request schemas, response formats, and
available operations. For protected operations, use the **Authorize**
control with a bearer token if prompted.

## Authentication and Authorization

1.  Submit credentials to `POST /auth/login`.

2.  Store the JWT returned by the API in the frontend's authentication
    flow.

3.  Send the token in the request header:

    ``` http
    Authorization: Bearer <your-token>
    ```

4.  Spring Security validates the token and applies authorization rules.

5.  Regular users should only access their own interview-related
    records; admin access is role-restricted.

A `401 Unauthorized` response usually indicates missing or invalid
authentication. A `403 Forbidden` response indicates that the request is
not authorized.

## Screenshots

Add screenshots to a directory such as `docs/screenshots/`, then replace
the placeholders below with the actual image paths.

### Login

![InterviewIQ login screenshot](docs/screenshots/login.png)

### User dashboard

![InterviewIQ dashboard screenshot](docs/screenshots/dashboard.png)

### Interview details, questions, and journal

![InterviewIQ interview details
screenshot](docs/screenshots/interview-details.png)

### Admin dashboard

![InterviewIQ admin dashboard
screenshot](docs/screenshots/admin-dashboard.png)

> The image paths above are placeholders. Add the corresponding image
> files before relying on these previews in the repository.

## Troubleshooting

### Backend cannot connect to PostgreSQL

-   Confirm PostgreSQL is running.
-   Confirm the database name, username, password, and JDBC URL.
-   Ensure `DB_USERNAME` and `DB_PASSWORD` are available in the terminal
    running Spring Boot.

### Missing `JWT_SECRET`

-   Set `JWT_SECRET` before starting the backend.
-   Restart Spring Boot after changing environment variables.
-   If the secret changes, tokens signed with the previous secret will
    no longer validate.

### Frontend cannot reach the backend

-   Confirm Spring Boot is running on port `8080`.
-   Check the Axios base URL in `frontend/src/api/axios.js`.
-   Check browser developer tools for request errors and CORS messages.

### Maven wrapper permission issue on macOS/Linux

If needed, make the wrapper executable:

``` bash
chmod +x mvnw
./mvnw spring-boot:run
```

## Security Notes

-   Never commit database passwords, JWT signing secrets, API keys, or
    real `.env` files.
-   Keep local secrets in environment variables or a secure secrets
    manager.
-   Use a strong, unique JWT signing secret. Rotate any secret that has
    been exposed.
-   Do not use example credentials or development defaults in
    production.
-   Review `spring.jpa.hibernate.ddl-auto` and SQL/security logging
    settings before production use.
-   Configure production CORS, HTTPS, database credentials, and secret
    management before deployment.
-   Do not expose real user data in screenshots, logs, or issue reports.

## Future Improvements

Potential next steps for the project include:

-   Finish consistent toast notifications and loading/empty states
    across all frontend pages.
-   Add profile editing and password-change flows.
-   Add automated backend and frontend tests.
-   Add deployment configuration and production environment setup.
-   Add real screenshots and a short product demo.

------------------------------------------------------------------------

Built as a full-stack interview tracking and reflection project.
