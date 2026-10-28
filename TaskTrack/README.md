# TaskTrack – Task Management System

A full-stack CRUD project built with React, HTML, CSS, JavaScript, Java Spring Boot, and MySQL.

## Features
- Create, list, edit, and delete tasks
- Task title, description, due date, priority, and status
- Filter tasks by status and search by title/description
- Dashboard counts for total, pending, in-progress, and completed tasks
- React frontend connected to Spring Boot REST APIs
- MySQL persistence

## Requirements
- JDK 17 or newer
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8+

## 1. Create the database
Open MySQL Workbench or a MySQL terminal and run:

```sql
CREATE DATABASE tasktrack_db;
```

The backend uses these defaults:
- URL: `jdbc:mysql://localhost:3306/tasktrack_db`
- Username: `root`
- Password: `root`

Set your own credentials in `backend/src/main/resources/application.properties` or environment variables:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

## 2. Run the Spring Boot backend
Open a terminal in the `backend` folder:

```bash
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

If Maven is not installed, install Maven and confirm `mvn -v` works. You can also import the `backend` folder into IntelliJ IDEA or Eclipse as a Maven project.

## 3. Run the React frontend
Open a second terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## REST API
Base URL: `http://localhost:8080/api/tasks`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/{id}` | Get one task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

Optional filtering: `GET /api/tasks?status=PENDING`

## Notes
- The backend creates the `tasks` table automatically with `spring.jpa.hibernate.ddl-auto=update`.
- Use only the status values `PENDING`, `IN_PROGRESS`, and `COMPLETED`.
- Use only the priority values `LOW`, `MEDIUM`, and `HIGH`.
- This is a learning project. Add authentication and authorization before deploying it publicly.
