const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
  "from-red-500 to-amber-400",
  "from-blue-500 to-indigo-500",
];

const hashName = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

const SigmaAvatar = ({ name = "", size = "md", className = "" }) => {
  const gradient = GRADIENTS[hashName(name) % GRADIENTS.length];
  const initials = getInitials(name);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br font-medium text-white
        ${gradient} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default SigmaAvatar;
