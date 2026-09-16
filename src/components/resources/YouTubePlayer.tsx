import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play, ExternalLink, Check, AlertCircle } from "lucide-react";
import { api } from "@/services/api";

interface YouTubePlayerProps {
  topicId: string;
  videoId: string;
  title: string;
  channelTitle?: string;
  duration?: string;
  url?: string;
  youtubeUrl?: string;
  embedUrl?: string;
  watchedSeconds?: number;
  durationSeconds?: number;
  percentage?: number;
  completed?: boolean;
  onProgressUpdate?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Clean helper function to extract pure 11-char YouTube video ID.
 */
export function extractYouTubeVideoId(input: string): string {
  if (!input || typeof input !== "string") return "";
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match && match[1] ? match[1] : trimmed;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  topicId,
  videoId: rawVideoId,
  title,
  channelTitle = "YouTube Channel",
  duration = "15:00",
  url,
  youtubeUrl,
  embedUrl,
  watchedSeconds = 0,
  durationSeconds = 0,
  percentage = 0,
  completed = false,
  onProgressUpdate
}) => {
  const cleanId = extractYouTubeVideoId(rawVideoId);
  const isValidVideoId = Boolean(cleanId && cleanId.length === 11);

  const formattedYoutubeUrl = youtubeUrl || url || `https://www.youtube.com/watch?v=${cleanId}`;
  const formattedEmbedUrl = `https://www.youtube.com/embed/${cleanId}`;

  const [currentProgress, setCurrentProgress] = useState<number>(percentage);
  const [isCompleted, setIsCompleted] = useState<boolean>(completed);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(!isValidVideoId);

  const playerRef = useRef<any>(null);
  const iframeId = useRef(`yt-iframe-${cleanId}-${Math.random().toString(36).substring(2, 7)}`).current;

  // Primary and fallback thumbnail URLs
  const primaryThumb = `https://i.ytimg.com/vi/${cleanId}/mqdefault.jpg`;
  const fallbackThumb = `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;
  const [imgSrc, setImgSrc] = useState<string>(primaryThumb);

  useEffect(() => {
    setImgSrc(primaryThumb);
  }, [cleanId]);

  useEffect(() => {
    setCurrentProgress(percentage);
    setIsCompleted(completed);
  }, [percentage, completed]);

  // Load YouTube IFrame API script tag once
  useEffect(() => {
    if (typeof window !== "undefined" && !window.YT) {
      const existingScript = document.getElementById("youtube-iframe-api-script");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
    }
  }, []);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handlePlayClick = () => {
    if (!isValidVideoId) {
      setHasPlaybackError(true);
      return;
    }
    setHasPlaybackError(false);
    setIsPlaying(true);
  };

  // Attach YT.Player for progress tracking after iframe is mounted
  useEffect(() => {
    if (!isPlaying || hasPlaybackError || !isValidVideoId) return;

    const attachPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          playerRef.current = new window.YT.Player(iframeId, {
            events: {
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (event.data === 1 || event.data === 2 || event.data === 0) {
                  trackVideoProgress();
                }
              },
              onError: (event: any) => {
                console.warn(`YouTube player event code ${event.data} for video: ${cleanId}`);
                // Only trigger non-embeddable fallback if error code is 101 or 150 (owner disabled embedding)
                if (event.data === 101 || event.data === 150) {
                  setHasPlaybackError(true);
                }
              }
            }
          });
        } catch (err) {
          console.warn("Failed attaching YT.Player event listeners:", err);
        }
      }
    };

    const timer = setTimeout(() => {
      attachPlayer();
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlaying, hasPlaybackError, isValidVideoId, cleanId, iframeId]);

  const trackVideoProgress = async () => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;

    try {
      const current = Math.floor(playerRef.current.getCurrentTime() || 0);
      const dur = Math.floor(playerRef.current.getDuration() || 0);

      if (dur > 0) {
        const calcPct = Math.min(100, Math.round((current / dur) * 100));
        setCurrentProgress(calcPct);

        const res = await api.updateVideoProgress(cleanId, {
          topicId,
          watchedSeconds: current,
          durationSeconds: dur,
          percentage: calcPct
        });

        if (res.completed) {
          setIsCompleted(true);
        }
        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    } catch (err) {
      console.warn("Error tracking video progress:", err);
    }
  };

  // Periodic watch progress save every 5 seconds while playing
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !hasPlaybackError) {
      interval = setInterval(() => {
        trackVideoProgress();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, hasPlaybackError]);

  const handleManualToggleWatched = async () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    const calcPct = newCompleted ? 100 : 0;
    setCurrentProgress(calcPct);

    try {
      await api.updateVideoProgress(cleanId, {
        topicId,
        watchedSeconds: newCompleted ? 600 : 0,
        durationSeconds: 600,
        percentage: calcPct
      });
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (err) {
      console.error("Failed toggling manual video progress:", err);
    }
  };

  // Clean iframe embed URL with enablejsapi=1 & autoplay=1
  const iframeSrc = `${formattedEmbedUrl}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Video Container with Responsive aspect-video */}
      <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        {isPlaying && !hasPlaybackError && isValidVideoId ? (
          /* Official YouTube IFrame Embed */
          <iframe
            id={iframeId}
            src={iframeSrc}
            title={title}
            className="w-full h-full border-0 block"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : hasPlaybackError ? (
          /* Non-Embeddable / Restricted Video Fallback Experience */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center text-white bg-slate-900">
            {isValidVideoId && (
              <img
                src={imgSrc}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
            )}
            <div className="relative z-10 space-y-3 max-w-xs">
              <div className="inline-flex items-center justify-center gap-1.5 text-amber-300 text-xs font-semibold bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                <AlertCircle className="h-4 w-4 text-amber-400" /> Playback Restricted
              </div>

              <p className="text-xs text-slate-200 leading-snug">
                This video cannot be played inside the app.
              </p>

              <a
                href={formattedYoutubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#6C4CE8] hover:bg-[#5B4BE7] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ) : (
          /* Normal Video Cover Thumbnail with Play Button */
          <div className="relative w-full h-full group cursor-pointer" onClick={handlePlayClick}>
            <img
              src={imgSrc}
              alt={title}
              onError={() => {
                if (imgSrc !== fallbackThumb) {
                  setImgSrc(fallbackThumb);
                } else {
                  setImgSrc(`https://img.youtube.com/vi/${cleanId}/0.jpg`);
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 bg-[#6C4CE8] text-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-current ml-1" />
              </div>
            </div>
            {duration && (
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded font-medium">
                {duration}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info & Watch Progress Controls */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{title}</h4>
          <p className="text-xs text-slate-500 font-medium pt-1">{channelTitle}</p>
        </div>

        {/* Dynamic Watch Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Progress</span>
            <span className="text-purple-700">{currentProgress}%</span>
          </div>
          <div className="w-full bg-purple-50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#6C4CE8] h-full transition-all duration-300 rounded-full"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleManualToggleWatched}
            className={`h-8 px-3 rounded-xl text-xs font-semibold ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Watched (100%)
              </span>
            ) : (
              "Mark Watched"
            )}
          </Button>

          <a
            href={formattedYoutubeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1 hover:underline"
          >
            Open YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
