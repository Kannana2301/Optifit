# OptiFit Fitness Web App

A full-stack fitness management application with a React + Vite frontend and a Node.js + Express backend using MySQL.

## Overview

OptiFit helps users manage fitness goals, track workouts, plan meals, monitor progress, and get AI-powered coaching.

The project includes:
- Authentication with signup/login and JWT-protected routes
- Workout library, weekly workout plans, custom workout creation, and workout completion tracking
- Meal planner with diet filters, allergy handling, scheduling, and grocery list support
- Progress tracking for weight, body measurements, calories burned, photos, and charts
- AI coach for fitness Q&A, workout generation, meal plan generation, and progress insights
- Notifications and reminders for water, workout, meal, and achievement goals
- Admin management panel for exercises, workouts, meals, and analytics

## Tech stack

- Backend: Node.js, Express, MySQL, bcrypt, jsonwebtoken, multer, cors
- Frontend: React, Vite, React Router, Axios, Bootstrap, Framer Motion

## Project structure

- `backend/` – Express server, API routes, authentication, MySQL schema, data seeding, file uploads
- `my-vite-app/` – React frontend, protected routes, dashboard, pages, components, API client

## Backend features

- `/signup` and `/login` endpoints
- Protected `/api` routes for dashboard, exercises, workouts, progress, meals, profile, notifications, and AI coach
- `/get-diet` endpoint for diet plan recommendation based on allergy, age, or goal
- Auto-creates and seeds the MySQL database schema on startup
- Supports uploading profile pictures, progress images, exercise images, and file-based uploads via `/uploads`

## Frontend features

- Secure route protection using JWT stored in `localStorage`
- Pages for dashboard, workouts, progress, meal planner, profile, notifications, AI coach, and admin management
- AI coach with chat history, generated workouts, and generated meal plans
- Supplement shop pages for product browsing
- Lazy loading using React `Suspense`

## Environment setup

### Backend

Create `backend/.env` with values like:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=5533
DB_NAME=optifit
DB_CONNECTION_LIMIT=10
JWT_SECRET=your_secret_key
PORT=3000
```

If `backend/.env` is not provided, defaults are used:
- `DB_HOST=localhost`
- `DB_USER=root`
- `DB_PASSWORD=5533`
- `DB_NAME=optifit`
- `DB_CONNECTION_LIMIT=10`
- `JWT_SECRET=your_secret_key`
- `PORT=3000`

### Frontend

Optionally create `my-vite-app/.env` with:

```env
VITE_API_BASE_URL=http://localhost:3000
```

If omitted, the frontend defaults to `http://localhost:3000` for API calls.

## Getting started

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd ../my-vite-app
   npm install
   ```
3. Start the backend server:
   ```bash
   cd ../backend
   npm start
   ```
4. Start the frontend app:
   ```bash
   cd ../my-vite-app
   npm run dev
   ```

## Common commands

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd my-vite-app
npm run dev
npm run build
npm run preview
```

## Notes

- The repository is already configured to ignore environment files and dependency folders via `.gitignore`.
- Keep sensitive values like `JWT_SECRET` and database credentials out of version control.
- Ensure MySQL is running locally or update `DB_HOST` and credentials in `backend/.env`.

## Optional improvements

- Add tests for backend routes and frontend components
- Replace hard-coded API seeding with seed scripts for a production-ready deployment
- Add a dedicated admin authentication role for the admin panel
