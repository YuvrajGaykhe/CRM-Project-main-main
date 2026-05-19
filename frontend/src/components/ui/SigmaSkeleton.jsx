const variants = {
  text: "h-4 w-full rounded",
  circle: "h-10 w-10 rounded-full",
  card: "h-32 w-full rounded-lg",
  row: "h-12 w-full rounded-lg",
};

const SigmaSkeleton = ({ variant = "text", className = "", count = 1 }) => {
  const baseClass = variants[variant] || variants.text;

  if (variant === "table") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-10 w-full animate-pulse rounded-lg bg-white/8" />
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-lg bg-white/5"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (count > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-white/8 ${baseClass}`}
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`animate-pulse bg-white/8 ${baseClass} ${className}`} />
  );
};

export default SigmaSkeleton;
