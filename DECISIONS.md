# DECISIONS.md - Architectural & Design Record

This document records the key architectural decisions, design trade-offs, data models, and security choices made during the development of the **AI Career Web Planner** web application.

---

## 1. Backend Architecture: Node/Express Proxy Server (`/server`)

### Choice
We implemented a lightweight Node.js + Express backend server located in the `/server` directory rather than placing raw Gemini and YouTube API calls directly in the client bundle.

### Rationale & Trade-offs
- **Security**: Hardcoding or storing `GEMINI_API_KEY` or unrestricted `YOUTUBE_API_KEY` in frontend `.env` files risks exposing API keys in compiled browser JavaScript bundles (`/dist`).
- **Control & Validation**: The proxy server validates incoming payloads (e.g. `careerTitle` string length, sanitization) using Zod before calling upstream Google APIs.
- **Production Readiness**: For local interview demonstrations, running `npm run dev:all` launches both Vite and the proxy server concurrently. In production, this proxy layer can easily be deployed as serverless functions (Vercel Serverless, Cloud Functions) without refactoring the client code.

---

## 2. Gemini AI Model Selection & Robust JSON Parsing

### Model Choice
- **Model**: `gemini-2.5-flash` (via official `@google/generative-ai` SDK).

### JSON Parsing & Reliability Strategy
- Gemini is instructed via a strict system prompt to output ONLY raw JSON without markdown codeblock fences (` ```json `).
- Incoming text is sanitized by stripping backticks and whitespace before parsing.
- A **two-tier parsing strategy** is employed:
  1. Primary parse + Zod schema validation (`StepSchema`).
  2. Automatic single retry with an amplified "Strict RAW JSON ONLY" instruction if initial parsing or schema validation fails.
- On persistent failure, a descriptive error message is returned to the client rather than generating fake or fallback content.

---

## 3. Data Model for Custom Goals

### Choice
- Custom goals are saved as task documents inside the `roadmaps/{roadmapId}/tasks` subcollection with `isCustomGoal: true`.

### Rationale
- Storing custom goals alongside AI-generated tasks in the same subcollection allows custom goals to count seamlessly towards the roadmap's total step count and completion percentage.
- When a user adds a custom goal, the proxy server searches for relevant YouTube learning resources for the goal title, keeping the learning experience consistent.

---

## 4. Real-time Progress Tracking & Aggregation

### Choice
- User statistics (`roadmapsCreated`, `tasksCompleted`, `tasksInProgress`, `overallCompletion`) are computed dynamically from real Firestore documents upon each task toggle or roadmap creation and cached in `users/{uid}.stats`.
- Real-time `onSnapshot` subscriptions update the UI instantly when tasks or roadmaps are updated.

---

## 5. YouTube Watch Tracking: YouTube IFrame Player API

### Choice
- Implemented **real YouTube IFrame Player API `onStateChange` listener** in `src/components/resources/YouTubePlayer.tsx`.

### Implementation Details
- When a user plays an embedded YouTube video, the IFrame Player API listens for event state `0` (`YT.PlayerState.ENDED`).
- When the video reaches the end, the component automatically triggers `onToggleWatched(true)`, persisting `watched: true` to Firestore for that task video.
- A manual "Mark Watched / Unwatch" toggle button is also rendered as a fallback control.

---

## 6. Firestore Security Rules & Data Isolation Testing

### Security Rules Architecture (`firestore.rules`)
- **User Document**: `users/{userId}` is strictly restricted to `request.auth.uid == userId`.
- **Roadmaps**: `roadmaps/{roadmapId}` requires `request.resource.data.ownerId == request.auth.uid` on creation and `resource.data.ownerId == request.auth.uid` on read/update/delete.
- **Tasks**: `roadmaps/{roadmapId}/tasks/{taskId}` requires checking parent roadmap ownership via `get(/databases/$(database)/documents/roadmaps/$(roadmapId)).data.ownerId == request.auth.uid`.

### Emulator & Testing Verification
- Automated unit test suite in `firestore.rules.test.ts` validates that User B cannot read or modify User A's roadmaps or tasks.
- **Manual REST API Verification Command** (using curl against Firestore REST API with User B's token):
  ```bash
  curl -H "Authorization: Bearer <USER_B_ID_TOKEN>" \
    https://firestore.googleapis.com/v1/projects/<YOUR_PROJECT_ID>/databases/(default)/documents/users/<USER_A_UID>
  ```
  Returns `403 Permission Denied`, confirming database-level isolation.
