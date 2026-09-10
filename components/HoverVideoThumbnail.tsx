"use client";

import { useEffect, useRef, useState } from "react";
import PortfolioImage from "@/components/PortfolioImage";

type Props = {
  poster: string;
  video?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  loop?: boolean;
  hoverDelayMs?: number;
};

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
};

function allowHoverMedia() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /(^|-)2g$/i.test(connection.effectiveType)) return false;
  return true;
}

export default function HoverVideoThumbnail({
  poster,
  video,
  alt = "",
  sizes = "100vw",
  priority = false,
  className = "",
  loop = true,
  hoverDelayMs = 180,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceAttached = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const release = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      const el = ref.current;
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      sourceAttached.current = false;
      setPlaying(false);
      try { el.load(); } catch {}
    };

    const observer = root && typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) release();
        }, { rootMargin: "240px 0px" })
      : null;

    if (root && observer) observer.observe(root);
    return () => {
      observer?.disconnect();
      release();
    };
  }, []);

  const start = () => {
    if (!video || !allowHoverMedia()) return;
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(async () => {
      const el = ref.current;
      if (!el) return;

      try {
        if (!sourceAttached.current) {
          el.src = video;
          sourceAttached.current = true;
          el.load();
        }
        el.muted = true;
        el.currentTime = 0;
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }, hoverDelayMs);
  };

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const el = ref.current;
    if (el) {
      el.pause();
      try { el.currentTime = 0; } catch {}
    }
    setPlaying(false);
  };

  return (
    <div ref={rootRef} className={`hover-video-thumb ${className}`} onMouseEnter={start} onMouseLeave={stop}>
      <PortfolioImage
        className="hover-video-thumb__poster"
        src={poster}
        alt={alt}
        sizes={sizes}
        priority={priority}
      />
      {video ? (
        <video
          ref={ref}
          className={`hover-video-thumb__video ${playing ? "is-playing" : ""}`}
          muted
          loop={loop}
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
          data-hover-src={video}
        />
      ) : null}
    </div>
  );
}
