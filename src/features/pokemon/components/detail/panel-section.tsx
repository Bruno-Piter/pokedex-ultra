import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelSectionProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Card used to group content inside a detail tab. */
export function PanelSection({ title, description, action, children, className }: PanelSectionProps) {
  return (
    <section className={cn("glass-panel rounded-3xl p-4 sm:p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-bold sm:text-lg">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
