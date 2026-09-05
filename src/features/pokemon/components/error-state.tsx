"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "Nao foi possivel carregar os dados da PokeAPI. Verifique a conexao e tente de novo.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-12 text-center"
    >
      <AlertCircle className="size-10 text-destructive" />
      <div className="space-y-1">
        <p className="font-semibold">Failed to load</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      )}
    </motion.div>
  );
}