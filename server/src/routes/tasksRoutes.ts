import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// POST /api/tasks/:id/complete
router.post("/:id/complete", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const topicId = req.params.id;
    const now = new Date().toISOString();

    // Check if it's a topic or a custom goal
    const customGoal = await db.get("SELECT id FROM custom_goals WHERE id = ? AND user_id = ?", [topicId, userId]);

    if (customGoal) {
      await db.run("UPDATE custom_goals SET completed = 1, completed_at = ? WHERE id = ? AND user_id = ?", [
        now,
        topicId,
        userId
      ]);
      return res.json({ message: "Custom goal marked as completed." });
    }

    const topic = await db.get("SELECT id FROM roadmap_topics WHERE id = ?", [topicId]);
    if (!topic) {
      return res.status(404).json({ error: "Task or topic not found." });
    }

    const existing = await db.get("SELECT id FROM task_progress WHERE user_id = ? AND topic_id = ?", [userId, topicId]);
    if (existing) {
      await db.run("UPDATE task_progress SET completed = 1, completed_at = ? WHERE user_id = ? AND topic_id = ?", [
        now,
        userId,
        topicId
      ]);
    } else {
      const id = uuidv4();
      await db.run(
        "INSERT INTO task_progress (id, user_id, topic_id, completed, completed_at) VALUES (?, ?, ?, 1, ?)",
        [id, userId, topicId, now]
      );
    }

    return res.json({ message: "Task marked as completed." });
  } catch (error: any) {
    console.error("Error completing task:", error);
    return res.status(500).json({ error: "Failed to update task completion." });
  }
});

// POST /api/tasks/:id/uncomplete
router.post("/:id/uncomplete", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const topicId = req.params.id;

    // Check custom goal
    const customGoal = await db.get("SELECT id FROM custom_goals WHERE id = ? AND user_id = ?", [topicId, userId]);
    if (customGoal) {
      await db.run("UPDATE custom_goals SET completed = 0, completed_at = NULL WHERE id = ? AND user_id = ?", [
        topicId,
        userId
      ]);
      return res.json({ message: "Custom goal marked as pending." });
    }

    await db.run("UPDATE task_progress SET completed = 0, completed_at = NULL WHERE user_id = ? AND topic_id = ?", [
      userId,
      topicId
    ]);

    return res.json({ message: "Task marked as incomplete." });
  } catch (error: any) {
    console.error("Error uncompleting task:", error);
    return res.status(500).json({ error: "Failed to update task state." });
  }
});

export default router;
