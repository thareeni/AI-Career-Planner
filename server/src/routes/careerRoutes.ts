import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { generateStructuredRoadmap } from "../services/geminiClient.js";
import { searchYouTubeVideos, extractYouTubeVideoId } from "../services/youtubeClient.js";

const router = Router();

// POST /api/career/generate
router.post("/generate", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { careerTitle, education, experienceLevel, skills, interests } = req.body;

    if (!careerTitle || typeof careerTitle !== "string" || careerTitle.trim().length < 2) {
      return res.status(400).json({ error: "Please enter a valid career path (e.g. 'Data Scientist')." });
    }

    const title = careerTitle.trim();

    // Fetch user profile if context not passed
    const profile = await db.get("SELECT * FROM profiles WHERE user_id = ?", [userId]);
    const userContext = {
      education: education || profile?.education || "",
      experienceLevel: experienceLevel || profile?.experience_level || "Beginner",
      skills: skills || profile?.skills || "",
      interests: interests || profile?.interests || ""
    };

    // 1. Generate structured roadmap via Gemini / Fallback engine
    const roadmapData = await generateStructuredRoadmap(title, userContext);

    // 2. Save plan to database
    const planId = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO career_plans (id, user_id, career_title, overview, required_skills, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [planId, userId, roadmapData.career, roadmapData.overview, JSON.stringify(roadmapData.skills), now]
    );

    // Update target career in profile if empty
    if (!profile?.target_career || profile.target_career.trim().length === 0) {
      await db.run("UPDATE profiles SET target_career = ? WHERE user_id = ?", [roadmapData.career, userId]);
    }

    // 3. Save stages, topics, and initial learning videos
    for (let i = 0; i < roadmapData.stages.length; i++) {
      const stage = roadmapData.stages[i];
      const stageId = uuidv4();

      await db.run(
        `INSERT INTO roadmap_stages (id, plan_id, stage_number, title, description, duration, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [stageId, planId, i + 1, stage.title, stage.description, stage.duration || "2 Weeks", i + 1]
      );

      for (let j = 0; j < stage.topics.length; j++) {
        const topicTitle = stage.topics[j];
        const topicId = uuidv4();

        await db.run(
          `INSERT INTO roadmap_topics (id, stage_id, title, description, order_index)
           VALUES (?, ?, ?, ?, ?)`,
          [topicId, stageId, topicTitle, `Mastering ${topicTitle} for ${roadmapData.career}`, j + 1]
        );

        // Fetch YouTube videos for topic
        const searchQuery = `${roadmapData.career} ${topicTitle} tutorial`;
        const videos = await searchYouTubeVideos(searchQuery);

        for (const vid of videos) {
          const resId = uuidv4();
          const cleanId = extractYouTubeVideoId(vid.videoId);
          const youtubeUrl = `https://www.youtube.com/watch?v=${cleanId}`;
          await db.run(
            `INSERT INTO learning_resources (id, topic_id, video_id, title, thumbnail, channel_title, duration, url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [resId, topicId, cleanId, vid.title, vid.thumbnailUrl || vid.thumbnail, vid.channelTitle, vid.duration || "15:00", youtubeUrl]
          );
        }
      }
    }

    return res.status(201).json({
      message: "Roadmap generated successfully!",
      planId,
      career: roadmapData.career,
      overview: roadmapData.overview,
      skills: roadmapData.skills,
      stages: roadmapData.stages
    });
  } catch (error: any) {
    console.error("Error generating career roadmap:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI career roadmap." });
  }
});

// GET /api/career/plans
router.get("/plans", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const plans = await db.all("SELECT * FROM career_plans WHERE user_id = ? ORDER BY created_at DESC", [userId]);

    const result = [];
    for (const p of plans) {
      const stages = await db.all("SELECT id FROM roadmap_stages WHERE plan_id = ?", [p.id]);
      let totalTopics = 0;
      let completedTopics = 0;

      for (const st of stages) {
        const topics = await db.all("SELECT id FROM roadmap_topics WHERE stage_id = ?", [st.id]);
        totalTopics += topics.length;
        for (const top of topics) {
          const tp = await db.get("SELECT completed FROM task_progress WHERE user_id = ? AND topic_id = ?", [userId, top.id]);
          if (tp && tp.completed) completedTopics++;
        }
      }

      const customGoals = await db.all("SELECT completed FROM custom_goals WHERE user_id = ? AND plan_id = ?", [userId, p.id]);
      totalTopics += customGoals.length;
      completedTopics += customGoals.filter((cg) => cg.completed).length;

      const overallCompletion = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      result.push({
        id: p.id,
        careerTitle: p.career_title,
        overview: p.overview,
        requiredSkills: p.required_skills ? JSON.parse(p.required_skills) : [],
        createdAt: p.created_at,
        totalTopics,
        completedTopics,
        overallCompletion
      });
    }

    return res.json({ plans: result });
  } catch (error: any) {
    console.error("Error fetching career plans:", error);
    return res.status(500).json({ error: "Failed to fetch career plans." });
  }
});

// GET /api/career/plans/:id
router.get("/plans/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const planId = req.params.id;

    const plan = await db.get("SELECT * FROM career_plans WHERE id = ? AND user_id = ?", [planId, userId]);
    if (!plan) {
      return res.status(404).json({ error: "Career plan not found." });
    }

    const stages = await db.all("SELECT * FROM roadmap_stages WHERE plan_id = ? ORDER BY order_index ASC", [planId]);

    const stagesDetailed = [];
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;

    for (const stage of stages) {
      const topics = await db.all("SELECT * FROM roadmap_topics WHERE stage_id = ? ORDER BY order_index ASC", [stage.id]);
      const topicsDetailed = [];

      for (const topic of topics) {
        totalTopicsCount++;
        const prog = await db.get("SELECT completed, completed_at FROM task_progress WHERE user_id = ? AND topic_id = ?", [userId, topic.id]);
        const isCompleted = prog ? Boolean(prog.completed) : false;
        if (isCompleted) completedTopicsCount++;

        const videos = await db.all("SELECT * FROM learning_resources WHERE topic_id = ?", [topic.id]);
        const videosDetailed = [];

        for (const vid of videos) {
          const cleanId = extractYouTubeVideoId(vid.video_id);
          const vp = await db.get(
            "SELECT watched_seconds, duration_seconds, percentage, completed FROM video_progress WHERE user_id = ? AND topic_id = ? AND video_id = ?",
            [userId, topic.id, cleanId]
          );

          videosDetailed.push({
            id: vid.id,
            videoId: cleanId,
            title: vid.title,
            thumbnailUrl: vid.thumbnail || `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`,
            thumbnail: vid.thumbnail || `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`,
            channelTitle: vid.channel_title,
            duration: vid.duration,
            url: `https://www.youtube.com/watch?v=${cleanId}`,
            youtubeUrl: `https://www.youtube.com/watch?v=${cleanId}`,
            embedUrl: `https://www.youtube.com/embed/${cleanId}`,
            watchedSeconds: vp?.watched_seconds || 0,
            durationSeconds: vp?.duration_seconds || 0,
            percentage: vp?.percentage || 0,
            completed: vp?.completed ? true : false
          });
        }

        topicsDetailed.push({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          orderIndex: topic.order_index,
          completed: isCompleted,
          completedAt: prog?.completed_at || null,
          videos: videosDetailed
        });
      }

      stagesDetailed.push({
        id: stage.id,
        stageNumber: stage.stage_number,
        title: stage.title,
        description: stage.description,
        duration: stage.duration,
        topics: topicsDetailed
      });
    }

    const customGoals = await db.all("SELECT * FROM custom_goals WHERE user_id = ? AND plan_id = ? ORDER BY created_at ASC", [userId, planId]);
    const customGoalsDetailed = customGoals.map((cg) => {
      totalTopicsCount++;
      if (cg.completed) completedTopicsCount++;
      return {
        id: cg.id,
        title: cg.title,
        description: cg.description,
        completed: Boolean(cg.completed),
        completedAt: cg.completed_at,
        isCustomGoal: true
      };
    });

    const overallCompletion = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

    return res.json({
      plan: {
        id: plan.id,
        careerTitle: plan.career_title,
        overview: plan.overview,
        requiredSkills: plan.required_skills ? JSON.parse(plan.required_skills) : [],
        createdAt: plan.created_at,
        totalTopics: totalTopicsCount,
        completedTopics: completedTopicsCount,
        overallCompletion,
        stages: stagesDetailed,
        customGoals: customGoalsDetailed
      }
    });
  } catch (error: any) {
    console.error("Error fetching career plan detail:", error);
    return res.status(500).json({ error: "Failed to fetch career plan details." });
  }
});

export default router;
