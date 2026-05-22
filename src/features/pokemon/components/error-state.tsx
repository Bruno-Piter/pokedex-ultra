"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "Algo deu errado ao carregar os dados.",
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
        <p className="font-semibold">Erro ao carregar</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="size-4" />
          Tentar novamente
        </Button>
      )}
    </motion.div>
  );
}
