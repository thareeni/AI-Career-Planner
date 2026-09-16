export interface TaskState {
  completed: boolean;
}

export function calculateCompletionPercentage(tasks: TaskState[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completedCount = tasks.filter((t) => t.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
}

export function calculateAggregateStats(roadmapsWithTasks: { tasks: TaskState[] }[]) {
  const roadmapsCreated = roadmapsWithTasks.length;
  let totalTasks = 0;
  let tasksCompleted = 0;

  roadmapsWithTasks.forEach((rm) => {
    totalTasks += rm.tasks.length;
    tasksCompleted += rm.tasks.filter((t) => t.completed).length;
  });

  const tasksInProgress = totalTasks - tasksCompleted;
  const overallCompletion = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  return {
    roadmapsCreated,
    tasksCompleted,
    tasksInProgress,
    overallCompletion
  };
}
