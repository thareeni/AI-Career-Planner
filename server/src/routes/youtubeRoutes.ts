import { Router, Response } from "express";
import { searchYouTubeVideos } from "../services/youtubeClient.js";
import { AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /api/resources/youtube?query=
router.get("/youtube", async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.query || req.query.q) as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Query parameter 'query' or 'q' is required." });
    }

    const videos = await searchYouTubeVideos(query.trim());
    return res.json({ videos });
  } catch (error: any) {
    console.error("Error searching YouTube resources:", error);
    return res.status(500).json({ error: "Failed to fetch YouTube learning resources." });
  }
});

export default router;
