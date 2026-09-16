import { describe, it, expect } from "vitest";
import { z } from "zod";

const StepSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number(),
  searchKeywords: z.array(z.string()).default([])
});

const StepsArraySchema = z.array(StepSchema).min(1);

describe("Gemini Roadmap Output Validation", () => {
  it("successfully parses valid Gemini JSON array output", () => {
    const mockGeminiOutput = JSON.stringify([
      {
        title: "Learn Python Basics",
        description: "Master variables, data types, loops, and OOP concepts in Python.",
        order: 1,
        searchKeywords: ["Python programming tutorial", "Python basics for beginners"]
      },
      {
        title: "Study Machine Learning Fundamentals",
        description: "Understand supervised and unsupervised learning algorithms.",
        order: 2,
        searchKeywords: ["Machine learning course", "Scikit-Learn tutorial"]
      }
    ]);

    const parsed = JSON.parse(mockGeminiOutput);
    const validated = StepsArraySchema.parse(parsed);
    expect(validated).toHaveLength(2);
    expect(validated[0].title).toBe("Learn Python Basics");
    expect(validated[1].order).toBe(2);
  });

  it("throws ZodError on invalid schema structure", () => {
    const invalidOutput = JSON.stringify([
      {
        title: "", // Empty title violates min(1)
        description: "Missing order field"
      }
    ]);

    const parsed = JSON.parse(invalidOutput);
    expect(() => StepsArraySchema.parse(parsed)).toThrow();
  });
});
