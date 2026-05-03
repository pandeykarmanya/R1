# Team Task Manager

This is a full-stack team task manager built for the Round 1 assignment.

The app lets users sign up, login, create projects, add team members, assign tasks, and track task progress. It also has simple role-based access, where an admin can manage projects/tasks and members can work on their assigned tasks.

## Features

- User signup and login
- JWT based authentication
- Admin and member roles
- Create and manage projects
- Add and remove project members
- Create and assign tasks
- Update task status
- Dashboard with task summary
- Pagination for projects and tasks
- Simple responsive frontend

## Tech Stack

- React + Vite for frontend
- Node.js + Express for backend
- MongoDB + Mongoose for database
- JWT for authentication
- bcrypt for password hashing
- Railway for deployment

## Project Structure

```txt
R1/
  Backend/
    src/
      controllers/
      middleware/
      models/
      routes/
      app.js
      server.js

  Frontend/
    src/
      components/
      pages/
      services/
      App.jsx
```

## How To Run Locally

First start the backend:

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

Add your MongoDB URL and JWT secret in `Backend/.env`.

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Then start the frontend:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

Backend runs on:

```txt
http://localhost:8000
```

## Roles

New users are created as `member` by default.

For testing, I manually update one user role to `admin` from MongoDB.

Admin can:

- create projects
- add or remove members
- create and assign tasks
- update or delete tasks
- view all projects and tasks

Member can:

- view projects they are added to
- view tasks assigned to them
- update their own task status

## Main API Routes

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Projects

```txt
GET    /api/projects?page=1&limit=10
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:memberId
```

### Tasks

```txt
GET    /api/tasks?page=1&limit=10
GET    /api/tasks?status=todo&project=projectId
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
PATCH  /api/tasks/:id/status
```

### Dashboard

```txt
GET /api/dashboard
```

This returns total tasks, todo tasks, in-progress tasks, completed tasks, overdue tasks, and recent tasks.

### Users

```txt
GET /api/users
GET /api/users/members
```

These routes are used by admin to get members while assigning projects and tasks.

## Authentication

After login, backend returns a token. Frontend stores it in local storage and sends it with protected requests.

```txt
Authorization: Bearer <token>
```

## Deployment

The backend is planned to be deployed on Railway.

Required environment variables:

```txt
MONGO_URI
JWT_SECRET
PORT
```

For frontend deployment, set:

```txt
VITE_API_URL=your_backend_url/api
```

## Demo Flow

In the demo video, I will show:

1. Signup and login
2. Admin creating a project
3. Admin adding members
4. Admin creating and assigning a task
5. Member logging in
6. Member updating task status
7. Dashboard showing task progress

## Current Status

Backend APIs and frontend basic screens are completed. The next step is testing the full flow with real users and then deploying it.
