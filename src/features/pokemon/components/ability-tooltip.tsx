"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AbilityInfo } from "@/lib/data/catalog";
import { titleCase } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

type AbilityTooltipProps = {
  name: string;
  hidden: boolean;
  info: AbilityInfo | undefined;
  className?: string;
};

/** Ability name with its description on hover/focus (desktop list). */
export function AbilityTooltip({ name, hidden, info, className }: AbilityTooltipProps) {
  const label = info?.name ?? titleCase(name);

  return (
    <Tooltip>
      <TooltipTrigger
        render={<span tabIndex={0} />}
        className={cn(
          "block w-fit max-w-full cursor-help truncate rounded-sm text-left decoration-dotted underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring",
          hidden && "text-muted-foreground",
          className,
        )}
      >
        {label}
        {hidden ? <span className="ml-1 text-[10px] font-semibold uppercase opacity-70">H</span> : null}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs flex-col items-start gap-0 py-2 text-left leading-relaxed"
      >
        <p className="font-semibold">
          {label}
          {hidden ? <span className="ml-1.5 text-[10px] uppercase opacity-70">Hidden ability</span> : null}
        </p>
        <p className="mt-1 opacity-90">{info?.effect ?? "No description available."}</p>
      </TooltipContent>
    </Tooltip>
  );
}
