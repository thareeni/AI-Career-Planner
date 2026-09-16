import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/goals
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goals = await db.all("SELECT * FROM custom_goals WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return res.json({ goals });
  } catch (error: any) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ error: "Failed to fetch custom goals." });
  }
});

// POST /api/goals
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Goal title is required." });
    }

    let targetPlanId = planId;
    if (!targetPlanId) {
      const latestPlan = await db.get("SELECT id FROM career_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]);
      targetPlanId = latestPlan?.id;
    }

    if (!targetPlanId) {
      return res.status(400).json({ error: "Please generate a career roadmap first before adding custom goals." });
    }

    const goalId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO custom_goals (id, user_id, plan_id, title, description, completed, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [goalId, userId, targetPlanId, title.trim(), description ? description.trim() : "", now]
    );

    return res.status(201).json({
      message: "Custom goal added successfully!",
      goal: {
        id: goalId,
        planId: targetPlanId,
        title: title.trim(),
        description: description ? description.trim() : "",
        completed: false,
        createdAt: now
      }
    });
  } catch (error: any) {
    console.error("Error creating custom goal:", error);
    return res.status(500).json({ error: "Failed to create custom goal." });
  }
});

// PUT /api/goals/:id
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { title, description, completed } = req.body;

    const goal = await db.get("SELECT id FROM custom_goals WHERE id = ? AND user_id = ?", [goalId, userId]);
    if (!goal) {
      return res.status(404).json({ error: "Custom goal not found." });
    }

    const now = new Date().toISOString();
    const isCompleted = completed ? 1 : 0;
    const completedAt = isCompleted === 1 ? now : null;

    await db.run(
      `UPDATE custom_goals SET 
        title = COALESCE(?, title), 
        description = COALESCE(?, description), 
        completed = COALESCE(?, completed), 
        completed_at = ?
      WHERE id = ? AND user_id = ?`,
      [title ? title.trim() : null, description !== undefined ? description.trim() : null, completed !== undefined ? isCompleted : null, completedAt, goalId, userId]
    );

    return res.json({ message: "Custom goal updated successfully!" });
  } catch (error: any) {
    console.error("Error updating custom goal:", error);
    return res.status(500).json({ error: "Failed to update custom goal." });
  }
});

// DELETE /api/goals/:id
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    await db.run("DELETE FROM custom_goals WHERE id = ? AND user_id = ?", [goalId, userId]);

    return res.json({ message: "Custom goal deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting custom goal:", error);
    return res.status(500).json({ error: "Failed to delete custom goal." });
  }
});

export default router;
