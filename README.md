# AI CAREER PLANNER

An intelligent, full-stack career planning and video learning platform built with React, TypeScript, Express.js, Node.js, and a relational database (PostgreSQL / SQLite).

---

## 🚀 Features

1. **User Authentication & Profiles**
   - User Registration & Login with JWT token authentication and `bcryptjs` password hashing.
   - User Onboarding flow capturing target career, education level, degree, experience level, existing skills, and interests.
   - User Profile management with display name editing, email display, account dates, and aggregate statistics.

2. **AI-Powered Career Roadmap Generation**
   - Generates structured, step-by-step career learning roadmaps powered by Google Gemini AI.
   - Includes career overview, required technical skills, numbered stages (01, 02, 03...), estimated stage durations, and specific learning topics.

3. **YouTube Resource Curation & Embedded Player**
   - Automatic query-based video search using YouTube Data API.
   - Built-in embedded YouTube player with YouTube IFrame Player API event listeners.
   - Real-time tracking of `currentTime`, `duration`, and percentage watched.
   - Automatic video completion when reaching watch threshold (>= 90%).

4. **Task Completion & Custom Goals**
   - Real-time progress updates when completing topics or custom learning goals.
   - Ability to add custom goals to any active career roadmap.
   - Persisted completion state across sessions and logouts.

5. **Dashboard & Analytics**
   - Welcome banner with current target career.
   - Stat cards: Roadmaps Created, Tasks Completed, In Progress, Overall Completion %.
   - Visual progress bars dynamically calculated from stored database state.
   - Recent Tasks list with checkmarks and status badges (`Done` / `Pending`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide React icons, Radix UI.
- **Backend**: Node.js, Express.js, TypeScript (`tsx`).
- **Database**: PostgreSQL / SQLite (`sqlite3` / `pg`).
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs`.
- **AI Integration**: Google Gemini API (`@google/generative-ai`).
- **Video Integration**: YouTube Data API v3, YouTube IFrame Player API.

---

## 📊 Database Schema

```sql
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login_at TEXT
)

profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT NOT NULL,
  education TEXT,
  degree TEXT,
  experience_level TEXT,
  skills TEXT,
  interests TEXT,
  target_career TEXT,
  updated_at TEXT NOT NULL
)

career_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  career_title TEXT NOT NULL,
  overview TEXT,
  required_skills TEXT,
  created_at TEXT NOT NULL
)

roadmap_stages (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  stage_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  order_index INTEGER NOT NULL
)

roadmap_topics (
  id TEXT PRIMARY KEY,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL
)

learning_resources (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  channel_title TEXT,
  duration TEXT,
  url TEXT
)

video_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  percentage INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  updated_at TEXT NOT NULL
)

task_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  completed_at TEXT
)

custom_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL
)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user account.
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `POST /api/auth/logout` - Log out user session.
- `GET /api/auth/me` - Fetch authenticated user details.

### Profile
- `GET /api/profile` - Get user profile details and aggregate stats.
- `PUT /api/profile` - Update display name or preferences.
- `POST /api/profile/onboarding` - Save initial career onboarding choices.

### Career Roadmaps
- `POST /api/career/generate` - Generate AI career roadmap with stages & video resources.
- `GET /api/career/plans` - List all career plans created by user.
- `GET /api/career/plans/:id` - Get single career plan with stages, topics, and video progress.

### Tasks & Progress
- `POST /api/tasks/:id/complete` - Mark topic or custom goal complete.
- `POST /api/tasks/:id/uncomplete` - Mark topic or custom goal pending.
- `GET /api/progress/summary` - Get live dashboard completion metrics.
- `PUT /api/progress/video/:videoId` - Update video watch progress & auto-complete.

### Custom Goals & Resources
- `POST /api/goals` - Add custom goal to roadmap.
- `GET /api/goals` - List custom goals.
- `PUT /api/goals/:id` - Update custom goal.
- `DELETE /api/goals/:id` - Delete custom goal.
- `GET /api/resources/youtube?query=` - Search YouTube learning resources.

---

## ⚙️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   # Install root frontend dependencies
   npm install

   # Install backend server dependencies
   cd server
   npm install
   cd ..
   ```

2. **Environment Variables**:
   Create `.env` file in `/server`:
   ```env
   PORT=5000
   JWT_SECRET=ai-career-planner-secret-key-2025
   DATABASE_URL=postgres://user:password@localhost:5432/planner_db
   GEMINI_API_KEY=your_gemini_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```
   *(Note: If `DATABASE_URL` is omitted, the backend automatically initializes an SQLite database at `server/data/planner.db` for zero-configuration local execution).*

3. **Running the Application**:
   ```bash
   # Run both frontend and backend concurrently
   npm run dev:all

   # Or run individually:
   # Frontend (Vite) on http://localhost:5173
   npm run dev

   # Backend (Express API) on http://localhost:5000
   npm run server
   ```

---

## 💡 Technical Interview Explanation

### 1. Frontend Architecture
The frontend is designed around a modular React + TypeScript SPA utilizing Vite. State management for authentication is encapsulated inside `AuthContext`, providing global user session state and profile statistics. API calls are isolated inside a centralized REST service client (`src/services/api.ts`) with request interceptors attaching JWT Authorization headers.

### 2. Backend Architecture
The backend is a Node.js + Express REST API configured with middleware for CORS, body parsing, error handling, and JWT authentication (`authenticateToken`). Routes are separated into domain controllers (`authRoutes`, `profileRoutes`, `careerRoutes`, `tasksRoutes`, `progressRoutes`, `goalsRoutes`, `youtubeRoutes`).

### 3. Database Design & Persistence
The relational database abstraction layer (`server/src/db.ts`) handles multi-table relationships with foreign keys. User progress is aggregated dynamically from `task_progress`, `video_progress`, and `custom_goals` tables, ensuring strict data integrity and real-time accuracy.

### 4. Authentication Flow
Passwords are hashed server-side using `bcryptjs` before storage. Upon successful login or registration, a signed JWT token is returned to the client and persisted in `localStorage`. Protected client-side routes enforce authentication using `<ProtectedRoute>`.

### 5. AI Roadmap Generation
The backend interfaces with Google Gemini API via `@google/generative-ai`. Structured prompt engineering ensures the AI outputs strict JSON detailing stages, topics, and skill requirements tailored to the user's entered career title and background.

### 6. YouTube API Integration & Video Progress Tracking
When a roadmap topic is created, the backend searches YouTube for matching tutorial videos. The embedded `YouTubePlayer` component attaches listeners to the YouTube IFrame Player API state changes (`onStateChange`). As the user watches the video, periodic `currentTime` and `duration` values are transmitted to `PUT /api/progress/video/:videoId`. When watch percentage reaches 90%, the video and its parent roadmap topic are automatically marked as completed.

### 7. Overall Progress Calculation
Overall progress is computed using the formula:
$$\text{Overall Completion \%} = \left( \frac{\text{Completed Topics + Completed Custom Goals}}{\text{Total Topics + Total Custom Goals}} \right) \times 100$$
All metrics are derived directly from database records, preventing desynchronization between frontend UI and database state.
