type SkeletonProps = {
  className?: string;
  label?: string;
};

export function Skeleton({ className = "", label }: SkeletonProps) {
  return (
    <span
      className={`valie-skeleton ${className}`.trim()}
      aria-hidden={label ? undefined : true}
      role={label ? "status" : undefined}
      aria-label={label}
    />
  );
}

export default Skeleton;
