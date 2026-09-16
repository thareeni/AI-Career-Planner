import { VideoResource } from "@/types";

const PROXY_URL = import.meta.env.VITE_PROXY_SERVER_URL || "http://localhost:5000";

export async function fetchYouTubeResources(query: string): Promise<VideoResource[]> {
  if (!query || query.trim().length === 0) return [];

  try {
    const res = await fetch(`${PROXY_URL}/api/youtube/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      console.warn("YouTube API proxy returned non-200:", res.status);
      return [];
    }
    const data = await res.json();
    const videos = data.videos || [];
    return videos.map((v: any) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      channelTitle: v.channelTitle,
      watched: false
    }));
  } catch (err) {
    console.error("Failed to fetch YouTube resources:", err);
    return [];
  }
}
