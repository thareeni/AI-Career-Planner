export interface UserStats {
  roadmapsCreated: number;
  tasksCompleted: number;
  tasksInProgress: number;
  overallCompletion: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string | number;
  stats: UserStats;
}

export interface VideoResource {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  watched: boolean;
}

export interface RoadmapTask {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  completedAt: string | null;
  isCustomGoal: boolean;
  searchKeywords?: string[];
  videos?: VideoResource[];
}

export interface Roadmap {
  id: string;
  ownerId: string;
  careerTitle: string;
  totalSteps: number;
  source: "ai" | "custom";
  createdAt: string;
  steps?: RoadmapTask[];
  completedCount?: number;
  completionPercentage?: number;
}
