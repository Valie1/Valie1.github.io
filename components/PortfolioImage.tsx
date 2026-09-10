"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import Skeleton from "@/components/Skeleton";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

const SETTLE_MS = 220;

function isExternal(src: string) {
  return /^https?:\/\//i.test(src) || src.startsWith("data:");
}

export default function PortfolioImage({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  quality = 72,
  onLoad,
  onError,
}: Props) {
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

  const imageClassName = `${className || ""} portfolio-image ${loaded ? "is-loaded" : "is-loading"}`.trim();

  return (
    <>
      {showSkeleton ? (
        <Skeleton className={`portfolio-image__skeleton media-skeleton ${loaded ? "is-exiting" : ""}`.trim()} />
      ) : null}
      {isExternal(src) ? (
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          className={imageClassName}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          loading={priority ? undefined : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          unoptimized={src.toLowerCase().endsWith(".svg") || src.toLowerCase().endsWith(".gif")}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </>
  );
}
