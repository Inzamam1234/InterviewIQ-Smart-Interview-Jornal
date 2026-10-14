# InterviewIQ --- Smart Interview Journal

InterviewIQ is a web application that helps users keep track of their
job applications and interview experiences in one place.

When applying to multiple companies, it can be difficult to remember
interview rounds, questions asked, mistakes made, and topics to improve.
InterviewIQ helps organize this information so users can review their
progress and prepare better for upcoming interviews.

## What the Project Does

-   **Track interviews:** Save company names, job roles, application
    dates, interview status, current rounds, next-round dates, and
    feedback.
-   **Manage interview questions:** Add questions asked during an
    interview, label them by difficulty, and save answers and notes for
    revision.
-   **Maintain an interview journal:** Write about the interview
    experience, mistakes, lessons learned, and confidence level.
-   **View a dashboard:** See interview statistics, status counts,
    question totals, and average confidence level.
-   **Manage users:** Admin users can access the administration
    dashboard and manage user roles.
-   **Protect user data:** Authentication, role-based access control,
    and interview ownership checks help ensure users can access only the
    records they are authorized to view.

## How It Works

1.  A user signs in and receives a JWT.
2.  The React frontend sends requests to the Spring Boot backend.
3.  Spring Security validates authenticated requests and checks access
    permissions.
4.  The backend uses Spring Data JPA to read and write data in
    PostgreSQL.
5.  The frontend displays interview records, questions, journal entries,
    and dashboard statistics.

## Technologies Used

-   **Frontend:** React, Vite, JavaScript, React Router, Axios
-   **Backend:** Java, Spring Boot, Spring Security
-   **Authentication:** JWT and BCrypt password hashing
-   **Database:** PostgreSQL
-   **Data access:** Spring Data JPA and Hibernate
-   **API documentation:** Swagger / OpenAPI
-   **Notifications:** react-hot-toast

## Main Sections

### Dashboard

Shows a summary of interview activity, including counts by status, total
questions, and average confidence level.

### Interviews

Allows users to create, view, search, filter, paginate, update, and
delete interview records, subject to authorization rules.

### Questions

Keeps interview questions together with their difficulty, answers, and
notes.

### Journal

Stores reflections about an interview: what happened, what went wrong,
and what the user learned.

### Admin Dashboard

Provides administrative summaries and user-management features for users
with the `ADMIN` role.

## Running the Project Locally

### Requirements

-   Java version compatible with the project's Maven configuration
-   PostgreSQL
-   Node.js and npm

### 1. Clone the repository

``` bash
git clone https://github.com/Inzamam1234/InterviewIQ-Smart-Interview-Jornal.git
cd InterviewIQ-Smart-Interview-Jornal
```

### 2. Create the database

Create a PostgreSQL database named `interviewjournal`, or change the
JDBC URL in `src/main/resources/application.properties` to match your
database.

``` sql
CREATE DATABASE interviewjournal;
```

### 3. Configure environment variables

The backend configuration uses these environment variables:

-   `DB_USERNAME` --- PostgreSQL username (defaults to `injamam` if not
    set)
-   `DB_PASSWORD` --- PostgreSQL password (defaults to an empty value if
    not set)
-   `JWT_SECRET` --- secret used to sign JWTs; this must be set

On macOS/Linux, set them in the terminal used to start the backend:

``` bash
export DB_USERNAME='your_postgres_username'
export DB_PASSWORD='your_postgres_password'
export JWT_SECRET='your_generated_secret'
```

Generate a local secret if needed:

``` bash
openssl rand -base64 32
```

Do not commit real passwords or secrets to GitHub.

### 4. Start the backend

From the repository root:

``` bash
./mvnw spring-boot:run
```

The backend runs on port `8080` with the current local configuration.

### 5. Start the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

The current frontend API configuration points to
`http://localhost:8080`.

## API Documentation

With the backend running, open Swagger UI:

`http://localhost:8080/swagger-ui/index.html`

The OpenAPI document is available at:

`http://localhost:8080/v3/api-docs`

Swagger UI can be used to inspect available endpoints and test requests.
Protected endpoints require a valid bearer token.

## Project Structure

``` text
InterviewIQ-Smart-Interview-Jornal/
├── frontend/       # React and Vite frontend
├── src/main/java/  # Spring Boot backend
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── mvnw
```

## Screenshots

Add screenshots of your actual application here when ready.

### Dashboard

```{=html}
<!-- Add a dashboard screenshot here. -->
```
### Interview Details

```{=html}
<!-- Add an interview details screenshot here. -->
```
### Admin Dashboard

```{=html}
<!-- Add an admin dashboard screenshot here. -->
```
## Project Goal

The goal of InterviewIQ is to make interview preparation more organized
by keeping applications, interview questions, and personal reflections
together. Instead of losing useful experience after each interview,
users can review what they learned and use it to prepare for the next
opportunity.
