import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/progress/summary
router.get("/summary", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const plans = await db.all("SELECT id, career_title FROM career_plans WHERE user_id = ?", [userId]);

    const roadmapsCreated = plans.length;
    let totalTasks = 0;
    let tasksCompleted = 0;
    const recentTasks = [];

    for (const plan of plans) {
      const stages = await db.all("SELECT id FROM roadmap_stages WHERE plan_id = ?", [plan.id]);
      for (const stage of stages) {
        const topics = await db.all("SELECT * FROM roadmap_topics WHERE stage_id = ? ORDER BY order_index ASC", [
          stage.id
        ]);
        for (const topic of topics) {
          totalTasks++;
          const tp = await db.get("SELECT completed, completed_at FROM task_progress WHERE user_id = ? AND topic_id = ?", [
            userId,
            topic.id
          ]);
          const isDone = tp ? Boolean(tp.completed) : false;
          if (isDone) tasksCompleted++;

          recentTasks.push({
            id: topic.id,
            title: topic.title,
            completed: isDone,
            completedAt: tp?.completed_at || null,
            careerTitle: plan.career_title,
            isCustomGoal: false
          });
        }
      }

      const customGoals = await db.all("SELECT * FROM custom_goals WHERE user_id = ? AND plan_id = ?", [userId, plan.id]);
      for (const cg of customGoals) {
        totalTasks++;
        const isDone = Boolean(cg.completed);
        if (isDone) tasksCompleted++;

        recentTasks.push({
          id: cg.id,
          title: cg.title,
          completed: isDone,
          completedAt: cg.completed_at || null,
          careerTitle: plan.career_title,
          isCustomGoal: true
        });
      }
    }

    const tasksInProgress = Math.max(0, totalTasks - tasksCompleted);
    const overallCompletion = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    const profile = await db.get("SELECT target_career FROM profiles WHERE user_id = ?", [userId]);

    return res.json({
      summary: {
        targetCareer: profile?.target_career || (plans[0]?.career_title ?? "Not Set"),
        roadmapsCreated,
        tasksCompleted,
        totalTasks,
        tasksInProgress,
        overallCompletion,
        recentTasks: recentTasks.slice(0, 10)
      }
    });
  } catch (error: any) {
    console.error("Error fetching progress summary:", error);
    return res.status(500).json({ error: "Failed to fetch progress summary." });
  }
});

// GET /api/progress
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskProgresses = await db.all("SELECT * FROM task_progress WHERE user_id = ?", [userId]);
    const videoProgresses = await db.all("SELECT * FROM video_progress WHERE user_id = ?", [userId]);

    return res.json({
      taskProgresses,
      videoProgresses
    });
  } catch (error: any) {
    console.error("Error fetching progress:", error);
    return res.status(500).json({ error: "Failed to fetch progress data." });
  }
});

// PUT /api/progress/video/:videoId
router.put("/video/:videoId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const videoId = req.params.videoId;
    const { topicId, watchedSeconds, durationSeconds, percentage } = req.body;

    if (!topicId) {
      return res.status(400).json({ error: "topicId is required." });
    }

    const calcPercentage = percentage ?? (durationSeconds > 0 ? Math.round((watchedSeconds / durationSeconds) * 100) : 0);
    const isCompleted = calcPercentage >= 90 ? 1 : 0;
    const now = new Date().toISOString();

    const existing = await db.get(
      "SELECT id FROM video_progress WHERE user_id = ? AND topic_id = ? AND video_id = ?",
      [userId, topicId, videoId]
    );

    if (existing) {
      await db.run(
        `UPDATE video_progress SET 
          watched_seconds = ?, 
          duration_seconds = ?, 
          percentage = ?, 
          completed = ?, 
          updated_at = ? 
        WHERE id = ?`,
        [watchedSeconds || 0, durationSeconds || 0, calcPercentage, isCompleted, now, existing.id]
      );
    } else {
      const id = uuidv4();
      await db.run(
        `INSERT INTO video_progress (id, user_id, topic_id, video_id, watched_seconds, duration_seconds, percentage, completed, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, topicId, videoId, watchedSeconds || 0, durationSeconds || 0, calcPercentage, isCompleted, now]
      );
    }

    // Auto mark parent topic completed if video completed threshold reached
    if (isCompleted === 1) {
      const existingTaskProg = await db.get("SELECT id FROM task_progress WHERE user_id = ? AND topic_id = ?", [userId, topicId]);
      if (!existingTaskProg) {
        const tpId = uuidv4();
        await db.run("INSERT INTO task_progress (id, user_id, topic_id, completed, completed_at) VALUES (?, ?, ?, 1, ?)", [
          tpId,
          userId,
          topicId,
          now
        ]);
      } else {
        await db.run("UPDATE task_progress SET completed = 1, completed_at = ? WHERE user_id = ? AND topic_id = ?", [
          now,
          userId,
          topicId
        ]);
      }
    }

    return res.json({
      message: "Video progress updated.",
      percentage: calcPercentage,
      completed: Boolean(isCompleted)
    });
  } catch (error: any) {
    console.error("Error updating video progress:", error);
    return res.status(500).json({ error: "Failed to update video progress." });
  }
});

export default router;
