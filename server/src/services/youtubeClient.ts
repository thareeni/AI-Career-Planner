export interface YouTubeVideoResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  thumbnail?: string;
  channelTitle: string;
  duration?: string;
  url?: string;
  youtubeUrl?: string;
  embedUrl?: string;
}

/**
  Extracts pure 11-character YouTube video ID from strings, full URLs, shortened URLs, or embed URLs.
 */
export function extractYouTubeVideoId(input: string): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();

  // If it's already an 11-character alphanumeric YouTube ID string
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Extract from youtube.com/watch?v=ID, youtube.com/embed/ID, or youtu.be/ID
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }

  return trimmed;
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey && apiKey.trim().length > 5 && apiKey !== "your_youtube_api_key_here") {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&videoEmbeddable=true&maxResults=3&key=${apiKey}`;

    try {
      const res = await fetch(searchUrl);
      if (res.ok) {
        const data: any = await res.json();
        if (data && data.items && Array.isArray(data.items)) {
          const results = data.items
            .map((item: any) => {
              const rawId = item.id?.videoId || "";
              const cleanId = extractYouTubeVideoId(rawId);
              const thumb = item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
              
              return {
                videoId: cleanId,
                title: item.snippet?.title || "Educational Tutorial Video",
                thumbnailUrl: thumb,
                thumbnail: thumb,
                channelTitle: item.snippet?.channelTitle || "Learning Channel",
                duration: "15:00",
                url: `https://www.youtube.com/watch?v=${cleanId}`,
                youtubeUrl: `https://www.youtube.com/watch?v=${cleanId}`,
                embedUrl: `https://www.youtube.com/embed/${cleanId}`
              };
            })
            .filter((v: YouTubeVideoResult) => Boolean(v.videoId && v.videoId.length === 11));

          if (results.length > 0) return results;
        }
      }
    } catch (err: any) {
      console.warn("YouTube API search failed, fallback videos will be returned:", err);
    }
  }

  // Fallback curated YouTube videos matching common search queries (Verified Embeddable 11-char IDs)
  return getFallbackYouTubeVideos(query);
}

function getFallbackYouTubeVideos(query: string): YouTubeVideoResult[] {
  const lower = query.toLowerCase();

  let fallbackList = [
    {
      videoId: "qz0aGYrrlhU",
      title: "HTML & CSS Full Course - Beginner to Pro",
      channelTitle: "SuperSimpleDev",
      duration: "6:30:00"
    },
    {
      videoId: "kUMe1FH4CHE",
      title: "HTML Tutorial for Beginners - Full Course",
      channelTitle: "freeCodeCamp.org",
      duration: "2:00:00"
    }
  ];

  if (lower.includes("python")) {
    fallbackList = [
      {
        videoId: "_uQrJ0TkZlc",
        title: "Python Tutorial - Python for Beginners [Full Course]",
        channelTitle: "Programming with Mosh",
        duration: "6:14:07"
      },
      {
        videoId: "rfscVS0vtbw",
        title: "Learn Python - Full Course for Beginners",
        channelTitle: "freeCodeCamp.org",
        duration: "4:26:52"
      }
    ];
  } else if (lower.includes("sql") || lower.includes("database")) {
    fallbackList = [
      {
        videoId: "7S_tz1z_5bA",
        title: "SQL Tutorial - Full Database Course for Beginners",
        channelTitle: "programmingwithmosh",
        duration: "3:10:00"
      },
      {
        videoId: "HXV3zeQKqGY",
        title: "SQL Course - Beginner to Advanced",
        channelTitle: "freeCodeCamp.org",
        duration: "4:20:00"
      }
    ];
  } else if (lower.includes("machine learning") || lower.includes("statistics") || lower.includes("data")) {
    fallbackList = [
      {
        videoId: "i_LwzRVP7bg",
        title: "Machine Learning for Everybody – Full Course",
        channelTitle: "freeCodeCamp.org",
        duration: "3:50:00"
      },
      {
        videoId: "7eh4d6sabA0",
        title: "Machine Learning Course for Beginners",
        channelTitle: "freeCodeCamp.org",
        duration: "9:52:00"
      }
    ];
  } else if (lower.includes("git") || lower.includes("github")) {
    fallbackList = [
      {
        videoId: "RGOj5yH7evE",
        title: "Git and GitHub for Beginners - Crash Course",
        channelTitle: "freeCodeCamp.org",
        duration: "1:08:00"
      }
    ];
  }

  return fallbackList.map((item) => {
    const cleanId = extractYouTubeVideoId(item.videoId);
    const thumb = `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`;
    return {
      videoId: cleanId,
      title: item.title,
      thumbnailUrl: thumb,
      thumbnail: thumb,
      channelTitle: item.channelTitle,
      duration: item.duration,
      url: `https://www.youtube.com/watch?v=${cleanId}`,
      youtubeUrl: `https://www.youtube.com/watch?v=${cleanId}`,
      embedUrl: `https://www.youtube.com/embed/${cleanId}`
    };
  });
}
