import { describe, it, expect } from "vitest";
import { calculateCompletionPercentage, calculateAggregateStats } from "./progress";

describe("progress utils", () => {
  it("returns 0 for empty task list", () => {
    expect(calculateCompletionPercentage([])).toBe(0);
  });

  it("calculates correct percentage for mixed completed tasks", () => {
    const tasks = [
      { completed: true },
      { completed: true },
      { completed: false },
      { completed: false }
    ];
    expect(calculateCompletionPercentage(tasks)).toBe(50);
  });

  it("calculates correct aggregate stats across multiple roadmaps", () => {
    const roadmaps = [
      { tasks: [{ completed: true }, { completed: true }] },
      { tasks: [{ completed: false }, { completed: true }, { completed: false }] }
    ];

    const stats = calculateAggregateStats(roadmaps);
    expect(stats.roadmapsCreated).toBe(2);
    expect(stats.tasksCompleted).toBe(3);
    expect(stats.tasksInProgress).toBe(2);
    expect(stats.overallCompletion).toBe(60); // 3 / 5 = 60%
  });
});
