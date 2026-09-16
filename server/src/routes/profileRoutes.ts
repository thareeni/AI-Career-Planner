import { Router, Response } from "express";
import { db } from "../db.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/profile
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await db.get("SELECT email, created_at, last_login_at FROM users WHERE id = ?", [userId]);
    const profile = await db.get("SELECT * FROM profiles WHERE user_id = ?", [userId]);

    // Aggregate statistics
    const plans = await db.all("SELECT id FROM career_plans WHERE user_id = ?", [userId]);
    const roadmapsCreated = plans.length;

    let totalTopics = 0;
    let completedTopics = 0;

    for (const plan of plans) {
      const stages = await db.all("SELECT id FROM roadmap_stages WHERE plan_id = ?", [plan.id]);
      for (const stage of stages) {
        const topics = await db.all("SELECT id FROM roadmap_topics WHERE stage_id = ?", [stage.id]);
        totalTopics += topics.length;
        for (const topic of topics) {
          const prog = await db.get("SELECT completed FROM task_progress WHERE user_id = ? AND topic_id = ?", [
            userId,
            topic.id
          ]);
          if (prog && prog.completed) {
            completedTopics++;
          }
        }
      }

      const customGoals = await db.all("SELECT completed FROM custom_goals WHERE user_id = ? AND plan_id = ?", [
        userId,
        plan.id
      ]);
      totalTopics += customGoals.length;
      completedTopics += customGoals.filter((cg) => cg.completed).length;
    }

    const inProgress = Math.max(0, totalTopics - completedTopics);
    const overallCompletion = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return res.json({
      profile: {
        userId,
        email: user?.email,
        fullName: profile?.full_name || "",
        displayName: profile?.display_name || user?.email.split("@")[0],
        education: profile?.education || "",
        degree: profile?.degree || "",
        experienceLevel: profile?.experience_level || "",
        skills: profile?.skills || "",
        interests: profile?.interests || "",
        targetCareer: profile?.target_career || "",
        createdAt: user?.created_at,
        lastLoginAt: user?.last_login_at,
        stats: {
          roadmapsCreated,
          tasksCompleted: completedTopics,
          totalTasks: totalTopics,
          tasksInProgress: inProgress,
          overallCompletion
        }
      }
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Failed to load user profile." });
  }
});

// PUT /api/profile
router.put("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { displayName, fullName, education, degree, experienceLevel, skills, interests, targetCareer } = req.body;

    if (!displayName || displayName.trim().length === 0) {
      return res.status(400).json({ error: "Display name cannot be empty." });
    }

    const now = new Date().toISOString();
    await db.run(
      `UPDATE profiles SET 
        display_name = ?, 
        full_name = COALESCE(?, full_name),
        education = COALESCE(?, education),
        degree = COALESCE(?, degree),
        experience_level = COALESCE(?, experience_level),
        skills = COALESCE(?, skills),
        interests = COALESCE(?, interests),
        target_career = COALESCE(?, target_career),
        updated_at = ? 
      WHERE user_id = ?`,
      [
        displayName.trim(),
        fullName ?? null,
        education ?? null,
        degree ?? null,
        experienceLevel ?? null,
        skills ?? null,
        interests ?? null,
        targetCareer ?? null,
        now,
        userId
      ]
    );

    return res.json({ message: "Profile updated successfully!" });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

// POST /api/profile/onboarding
router.post("/onboarding", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { education, degree, experienceLevel, skills, interests, targetCareer } = req.body;

    const now = new Date().toISOString();
    await db.run(
      `UPDATE profiles SET 
        education = ?,
        degree = ?,
        experience_level = ?,
        skills = ?,
        interests = ?,
        target_career = ?,
        updated_at = ? 
      WHERE user_id = ?`,
      [
        education || "",
        degree || "",
        experienceLevel || "Beginner",
        skills || "",
        interests || "",
        targetCareer || "",
        now,
        userId
      ]
    );

    return res.json({ message: "Onboarding information saved successfully." });
  } catch (error: any) {
    console.error("Error saving onboarding details:", error);
    return res.status(500).json({ error: "Failed to save onboarding details." });
  }
});

export default router;
