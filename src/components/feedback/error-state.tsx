"use client";

import { motion } from "framer-motion";
import { RefreshCw, WifiOff, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Check your connection and try again.",
  onRetry,
  retrying = false,
  compact = false,
  className,
}: ErrorStateProps) {
  const online = useOnlineStatus();
  const Icon = online ? TriangleAlert : WifiOff;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 text-center",
        compact ? "p-6" : "p-10",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="font-semibold">{online ? title : "You're offline"}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {online
            ? message
            : "This hasn't been saved for offline use yet. It will load once you're back online."}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry} disabled={retrying} className="mt-1 h-9 gap-2 rounded-xl px-4">
          <RefreshCw className={cn("size-4", retrying && "animate-spin")} />
          {retrying ? "Retrying…" : "Try again"}
        </Button>
      ) : null}
    </motion.div>
  );
}
