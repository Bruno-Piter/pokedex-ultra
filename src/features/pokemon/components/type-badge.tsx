import { getTypeColor, getTypeTextColor } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

type TypeBadgeProps = {
  type: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "h-5 px-2 text-[10px]",
  md: "h-6 px-2.5 text-[11px]",
  lg: "h-7 px-3.5 text-xs",
};

export function TypeBadge({ type, size = "md", className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide uppercase shadow-sm ring-1 ring-black/10 ring-inset",
        SIZES[size],
        className,
      )}
      style={{
        backgroundColor: getTypeColor(type),
        backgroundImage: "linear-gradient(180deg, rgb(255 255 255 / 0.22), transparent 60%)",
        color: getTypeTextColor(type),
      }}
    >
      {type}
    </span>
  );
}
