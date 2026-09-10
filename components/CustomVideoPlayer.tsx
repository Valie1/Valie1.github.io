"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Skeleton from "@/components/Skeleton";
import { readMediaConsent, writeMediaConsent, MEDIA_CONSENT_CHANGE_EVENT, type MediaConsent } from "@/lib/mediaConsent";
import {
  Expand,
  Minimize,
  Pause,
  Play,
  ShieldCheck,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

function formatTime(time: number) {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function normalizeYouTubeEmbedSrc(input?: string) {
  const raw = String(input || "").trim().replace(/&amp;/g, "&");
  if (!raw) return "";

  const build = (id: string) =>
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;

  try {
    const url = /^https?:\/\//i.test(raw)
      ? new URL(raw)
      : typeof window !== "undefined"
        ? new URL(raw, window.location.href)
        : null;
    if (!url) return "";

    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    let id = "";

    if (host === "youtu.be") {
      id = parts[0] || "";
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (parts[0] === "embed") id = parts[1] || "";
      if (!id && parts[0] === "shorts") id = parts[1] || "";
      if (!id) id = url.searchParams.get("v") || "";
    }

    if (id) return build(id);
  } catch {
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/shorts\/|youtube(?:-nocookie)?\.com\/embed\/|[?&]v=)([A-Za-z0-9_-]{6,})/i);
    if (match?.[1]) return build(match[1]);
  }

  return "";
}

type Props = {
  aspect?: "landscape" | "portrait" | "square";
  src?: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onClose?: () => void;
  showCloseButton?: boolean;
};

type PlayerFeedback = "play" | "pause" | null;

type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  msExitFullscreen?: () => Promise<void> | void;
};

type FullscreenNode = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export default function CustomVideoPlayer({
  aspect = "landscape",
  src,
  title = "Portfolio video",
  poster,
  autoPlay = true,
  onClose,
  showCloseButton = true,
}: Props) {
  const hasSource = Boolean(src?.trim());
  const youtubeEmbedSrc = hasSource ? normalizeYouTubeEmbedSrc(src) : "";
  const isYouTube = Boolean(youtubeEmbedSrc);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastVolumeRef = useRef(1);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const youtubeSkeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrubbingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [loading, setLoading] = useState(hasSource && !isYouTube);
  const [youtubeLoading, setYoutubeLoading] = useState(isYouTube);
  const [youtubeSkeletonVisible, setYoutubeSkeletonVisible] = useState(isYouTube);
  const [failed, setFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const [feedback, setFeedback] = useState<PlayerFeedback>(null);
  const [mediaConsent, setMediaConsent] = useState<MediaConsent>(null);
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    setMediaConsent(readMediaConsent());
    setConsentReady(true);

    const onConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<Exclude<MediaConsent, null>>).detail;
      if (detail === "allowed" || detail === "rejected") setMediaConsent(detail);
    };

    window.addEventListener(MEDIA_CONSENT_CHANGE_EVENT, onConsentChange as EventListener);
    return () => window.removeEventListener(MEDIA_CONSENT_CHANGE_EVENT, onConsentChange as EventListener);
  }, []);

  const chooseMediaConsent = useCallback((next: Exclude<MediaConsent, null>) => {
    setMediaConsent(next);
    if (next === "allowed" && isYouTube) {
      setYoutubeLoading(true);
      setYoutubeSkeletonVisible(true);
    }
    writeMediaConsent(next);
  }, [isYouTube]);

  useEffect(() => {
    if (youtubeSkeletonTimerRef.current) {
      clearTimeout(youtubeSkeletonTimerRef.current);
      youtubeSkeletonTimerRef.current = null;
    }
    if (!isYouTube) {
      setYoutubeLoading(false);
      setYoutubeSkeletonVisible(false);
      return;
    }
    if (mediaConsent === "allowed") {
      setYoutubeLoading(true);
      setYoutubeSkeletonVisible(true);
    } else {
      setYoutubeSkeletonVisible(false);
    }
  }, [isYouTube, mediaConsent, youtubeEmbedSrc]);

  const showFeedback = useCallback((next: Exclude<PlayerFeedback, null>) => {
    setFeedback(next);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 700);
  }, []);

  const getFullscreenElement = useCallback(() => {
    const doc = document as FullscreenDocument;
    return document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || null;
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = getFullscreenElement() === playerRef.current;
      setIsFullscreen(active);
      if (!active) setPseudoFullscreen(false);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange as EventListener);
    document.addEventListener("MSFullscreenChange", onFullscreenChange as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange as EventListener);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange as EventListener);
    };
  }, [getFullscreenElement]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (youtubeSkeletonTimerRef.current) clearTimeout(youtubeSkeletonTimerRef.current);
      const video = videoRef.current;
      if (video) {
        try {
          video.pause();
          video.removeAttribute("src");
          video.removeAttribute("poster");
          video.load();
        } catch {

        }
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube || !autoPlay || !src) return;

    const attempt = window.setTimeout(() => {
      video.play().catch(() => {

      });
    }, 30);

    return () => window.clearTimeout(attempt);
  }, [autoPlay, isYouTube, src]);

  const toggle = useCallback(async () => {
    const video = videoRef.current;
    if (!video || isYouTube || failed) return;

    if (video.paused) {
      try {
        await video.play();
        showFeedback("play");
      } catch {
        return;
      }
    } else {
      video.pause();
      showFeedback("pause");
    }
  }, [failed, isYouTube, showFeedback]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    if (video.muted || video.volume === 0) {
      const restored = lastVolumeRef.current > 0 ? lastVolumeRef.current : 1;
      video.volume = restored;
      video.muted = false;
      setVolume(restored);
      setMuted(false);
    } else {
      lastVolumeRef.current = video.volume || 1;
      video.muted = true;
      setMuted(true);
    }
  }, [isYouTube]);

  const changeVolume = (nextVolume: number) => {
    const video = videoRef.current;
    if (!video || isYouTube) return;
    const value = Math.max(0, Math.min(1, nextVolume));
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
    if (value > 0) lastVolumeRef.current = value;
  };

  const fullscreen = useCallback(async () => {
    const node = playerRef.current as FullscreenNode | null;
    const video = videoRef.current as WebkitVideo | null;
    if (!node) return;

    const doc = document as FullscreenDocument;
    const fullscreenElement = getFullscreenElement();

    if (pseudoFullscreen && !fullscreenElement) {
      setPseudoFullscreen(false);
      return;
    }

    try {
      if (fullscreenElement === node) {
        const exit = document.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        await exit?.call(document);
        return;
      }

      if (!fullscreenElement) {
        const request = node.requestFullscreen || node.webkitRequestFullscreen || node.msRequestFullscreen;
        if (request) {
          await request.call(node);
          return;
        }

        if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
          return;
        }


        setPseudoFullscreen(true);
      }
    } catch {
      if (video?.webkitEnterFullscreen) {
        try {
          video.webkitEnterFullscreen();
          return;
        } catch {

        }
      }
      setPseudoFullscreen(true);
    }
  }, [getFullscreenElement, pseudoFullscreen]);

  const closePlayer = useCallback(async () => {


    const video = videoRef.current;
    if (video) {
      try { video.pause(); } catch {   }
    }
    const doc = document as FullscreenDocument;
    const fullscreenElement = getFullscreenElement();
    if (fullscreenElement === playerRef.current) {
      const exit = document.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
      try { await exit?.call(document); } catch {   }
    }
    setPseudoFullscreen(false);
    onClose?.();
  }, [getFullscreenElement, onClose]);

  const seekBy = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video || isYouTube) return;
    const next = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    video.currentTime = next;
    setCurrent(next);
  }, [isYouTube]);

  const updateBuffered = useCallback(() => {
    const video = videoRef.current;
    if (!video || isYouTube || !video.duration || !video.buffered.length) {
      setBuffered(0);
      return;
    }

    const end = video.buffered.end(video.buffered.length - 1);
    setBuffered(Math.min(100, Math.max(0, (end / video.duration) * 100)));
  }, [isYouTube]);

  const seekToClientX = useCallback((clientX: number) => {
    const video = videoRef.current;
    const timeline = timelineRef.current;
    if (!video || !timeline || !video.duration || isYouTube) return;

    const rect = timeline.getBoundingClientRect();
    if (!rect.width) return;
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const next = progress * video.duration;
    video.currentTime = next;
    setCurrent(next);
  }, [isYouTube]);

  const retry = () => {
    const video = videoRef.current;
    if (!video || isYouTube) return;
    setFailed(false);
    setLoading(true);
    setCurrent(0);
    setBuffered(0);
    video.load();
    if (autoPlay) video.play().catch(() => {});
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName)) return;

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        event.preventDefault();
        void closePlayer();
        return;
      }

      if (key === "f") {
        event.preventDefault();
        void fullscreen();
        return;
      }


      if (isYouTube) return;

      if (event.key === " " || key === "k") {
        event.preventDefault();
        void toggle();
      } else if (key === "m") {
        event.preventDefault();
        toggleMute();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekBy(-5);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        seekBy(5);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePlayer, fullscreen, isYouTube, seekBy, toggle, toggleMute]);

  const settleYouTubeFrame = useCallback(() => {
    setYoutubeLoading(false);
    if (youtubeSkeletonTimerRef.current) clearTimeout(youtubeSkeletonTimerRef.current);
    youtubeSkeletonTimerRef.current = setTimeout(() => {
      setYoutubeSkeletonVisible(false);
      youtubeSkeletonTimerRef.current = null;
    }, 220);
  }, []);

  const played = duration ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;
  const isPortrait = aspect === "portrait";
  const fullscreenClass = isFullscreen || pseudoFullscreen ? "is-fullscreen" : "";

  return (
    <div
      ref={playerRef}
      className={`video-player-frame video-player-frame--${aspect} ${fullscreenClass}`}
      role="region"
      tabIndex={0}
      aria-label={`${title}. Video player`}
    >
      {onClose && showCloseButton ? (
        <button className="video-player-close" type="button" onClick={() => void closePlayer()} aria-label="Close video">
          <X size={21} />
        </button>
      ) : null}

      <div className={`video-screen video-screen--${aspect}`}>
        {isYouTube ? (
          !consentReady ? (
            <div className="video-consent-gate is-checking" role="status" aria-label="Checking YouTube media privacy setting">
              <Skeleton className="video-consent-gate__skeleton media-skeleton" />
              <span className="sr-only">Checking privacy setting</span>
            </div>
          ) : mediaConsent === "allowed" ? (
            <>
              <iframe
                className={`video-youtube-embed ${youtubeLoading ? "is-loading" : "is-loaded"}`}
                src={youtubeEmbedSrc}
                title={title}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={settleYouTubeFrame}
              />
              {youtubeSkeletonVisible ? (
                <div className={`video-youtube-loading media-skeleton ${youtubeLoading ? "" : "is-exiting"}`.trim()} aria-hidden="true">
                  <Skeleton className="video-loading-skeleton" />
                </div>
              ) : null}
            </>
          ) : (
            <div className="video-consent-gate" role="group" aria-label="YouTube media privacy choice">
              <span className="video-consent-gate__icon" aria-hidden="true"><ShieldCheck size={24} /></span>
              <p className="video-consent-gate__eyebrow">YOUTUBE MEDIA BLOCKED</p>
              <h3>ALLOW OPTIONAL MEDIA TO PLAY</h3>
              <p>
                This video is hosted by YouTube. Allowing media connects your browser to YouTube/Google and may let that provider use cookies or similar storage.
              </p>
              <div className="video-consent-gate__actions">
                <button type="button" onClick={() => chooseMediaConsent("allowed")}>ALLOW &amp; PLAY</button>
                <button type="button" onClick={() => chooseMediaConsent("rejected")}>KEEP BLOCKED</button>
              </div>
              <a href="/cookies">COOKIE POLICY</a>
            </div>
          )
        ) : (
          <video
            ref={videoRef}
            src={src || undefined}
            playsInline
            preload={autoPlay ? "auto" : "metadata"}
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            poster={poster}
            onClick={() => void toggle()}
            onContextMenu={(event) => event.preventDefault()}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(event) => {
              if (!scrubbingRef.current) setCurrent(event.currentTarget.currentTime);
              updateBuffered();
            }}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration);
              setVolume(event.currentTarget.volume);
              setMuted(event.currentTarget.muted);
              setCurrent(event.currentTarget.currentTime || 0);
              updateBuffered();
            }}
            onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
            onProgress={updateBuffered}
            onCanPlay={() => setLoading(false)}
            onWaiting={() => setLoading(true)}
            onPlaying={() => setLoading(false)}
            onEnded={() => setPlaying(false)}
            onError={() => {
              setFailed(true);
              setLoading(false);
            }}
          />
        )}

        {!isYouTube && hasSource && loading && !failed && (
          <div className="video-loading video-loading--skeleton media-skeleton" aria-hidden="true">
            <Skeleton className="video-loading-skeleton" />
          </div>
        )}

        {!isYouTube && (!hasSource || failed) && (
          <div className="video-error" role="status" aria-live="polite">
            <span>VIDEO UNAVAILABLE</span>
            {hasSource ? <button type="button" onClick={retry}>RETRY</button> : null}
          </div>
        )}

        {!isYouTube && hasSource && !failed && feedback ? (
          <div className={`video-big-feedback is-${feedback}`} aria-hidden="true">
            <span>{feedback === "play" ? <Play size={34} fill="currentColor" /> : <Pause size={34} fill="currentColor" />}</span>
          </div>
        ) : null}

        {!isYouTube && hasSource && !failed && !playing && !loading && !feedback ? (
          <button className="center-play" type="button" onClick={() => void toggle()} aria-label="Play video">
            <Play size={25} fill="currentColor" />
          </button>
        ) : null}
      </div>

      {!isYouTube && hasSource && !failed ? (
        <div className="player-controls" role="group" aria-label="Video controls">
          <div
            ref={timelineRef}
            className="player-timeline"
            role="slider"
            tabIndex={0}
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, Math.floor(duration || 0))}
            aria-valuenow={Math.max(0, Math.floor(current || 0))}
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            aria-orientation="horizontal"
            onPointerDown={(event) => {
              scrubbingRef.current = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              seekToClientX(event.clientX);
            }}
            onPointerMove={(event) => {
              if (scrubbingRef.current) seekToClientX(event.clientX);
            }}
            onPointerUp={(event) => {
              seekToClientX(event.clientX);
              scrubbingRef.current = false;
              if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                event.currentTarget.releasePointerCapture?.(event.pointerId);
              }
            }}
            onPointerCancel={() => { scrubbingRef.current = false; }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                seekBy(-5);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                seekBy(5);
              } else if (event.key === "Home") {
                event.preventDefault();
                const video = videoRef.current;
                if (video) { video.currentTime = 0; setCurrent(0); }
              } else if (event.key === "End") {
                event.preventDefault();
                const video = videoRef.current;
                if (video?.duration) { video.currentTime = video.duration; setCurrent(video.duration); }
              }
            }}
          >
            <span className="player-timeline-buffer" style={{ width: `${buffered}%` }} aria-hidden="true" />
            <span className="player-timeline-progress" style={{ width: `${played}%` }} aria-hidden="true" />
            <span className="player-timeline-thumb" style={{ left: `${played}%` }} aria-hidden="true" />
          </div>

          <div className="player-row">
            <button type="button" onClick={() => void toggle()} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            <div className="player-volume">
              <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                aria-label="Volume"
                className="player-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={muted ? 0 : volume}
                aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`}
                onChange={(event) => changeVolume(Number(event.target.value))}
              />
            </div>

            <span className="player-time">
              {formatTime(current)} <i>/</i> {formatTime(duration)}
            </span>

            <div className="player-spacer" />

            <button type="button" onClick={() => void fullscreen()} aria-label={(isFullscreen || pseudoFullscreen) ? "Exit fullscreen" : "Fullscreen"}>
              {(isFullscreen || pseudoFullscreen) ? <Minimize size={18} /> : <Expand size={18} />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
