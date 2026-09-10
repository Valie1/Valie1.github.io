"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import Skeleton from "@/components/Skeleton";

type LoadedImageProps = {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  width: number;
  height: number;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

const SETTLE_MS = 220;

export default function LoadedImage({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  width,
  height,
  sizes,
  quality = 72,
  priority = false,
  onLoad,
  onError,
}: LoadedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    setLoaded(false);
    setShowSkeleton(true);
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, [src]);

  const settle = () => {
    setLoaded(true);
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      setShowSkeleton(false);
      settleTimerRef.current = null;
    }, SETTLE_MS);
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    settle();
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    settle();
    onError?.(event);
  };

  return (
    <>
      {showSkeleton ? (
        <Skeleton
          className={`loaded-image__skeleton media-skeleton ${loaded ? "is-exiting" : ""} ${skeletonClassName}`.trim()}
        />
      ) : null}
      <Image
        src={src}
        alt={alt}
        className={`${className} loaded-image ${loaded ? "is-loaded" : "is-loading"}`.trim()}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
