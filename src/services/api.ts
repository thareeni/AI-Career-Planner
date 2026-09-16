const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "An unexpected error occurred.");
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { email: string; password: string; fullName?: string }) =>
    request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", {
      method: "POST"
    }),

  getMe: () =>
    request<{ user: any }>("/auth/me"),

  // Profile
  getProfile: () =>
    request<{ profile: any }>("/profile"),

  updateProfile: (payload: any) =>
    request<{ message: string }>("/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  saveOnboarding: (payload: any) =>
    request<{ message: string }>("/profile/onboarding", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  // Career & AI Roadmaps
  generateRoadmap: (payload: { careerTitle: string; education?: string; experienceLevel?: string; skills?: string; interests?: string }) =>
    request<{ message: string; planId: string; career: string; overview: string; skills: string[]; stages: any[] }>("/career/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  getPlans: () =>
    request<{ plans: any[] }>("/career/plans"),

  getPlanById: (id: string) =>
    request<{ plan: any }>(`/career/plans/${id}`),

  // Tasks
  completeTask: (id: string) =>
    request<{ message: string }>(`/tasks/${id}/complete`, { method: "POST" }),

  uncompleteTask: (id: string) =>
    request<{ message: string }>(`/tasks/${id}/uncomplete`, { method: "POST" }),

  // Progress
  getProgressSummary: () =>
    request<{ summary: any }>("/progress/summary"),

  updateVideoProgress: (videoId: string, payload: { topicId: string; watchedSeconds: number; durationSeconds: number; percentage?: number }) =>
    request<{ message: string; percentage: number; completed: boolean }>(`/progress/video/${videoId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  // Custom Goals
  getGoals: () =>
    request<{ goals: any[] }>("/goals"),

  addGoal: (payload: { planId?: string; title: string; description?: string }) =>
    request<{ message: string; goal: any }>("/goals", {
      method: "POST",
      body: JSON.stringify(payload)
    }),

  updateGoal: (id: string, payload: { title?: string; description?: string; completed?: boolean }) =>
    request<{ message: string }>(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),

  deleteGoal: (id: string) =>
    request<{ message: string }>(`/goals/${id}`, { method: "DELETE" }),

  // YouTube Resources
  searchYouTube: (query: string) =>
    request<{ videos: any[] }>(`/resources/youtube?query=${encodeURIComponent(query)}`)
};
