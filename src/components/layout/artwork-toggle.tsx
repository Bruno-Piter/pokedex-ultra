"use client";

import { ImageIcon, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArtworkMode } from "@/providers/artwork-provider";

export function ArtworkToggle() {
  const { mode, toggle, mounted } = useArtworkMode();
  const isPixel = mode === "pixel";

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9" disabled>
        <ImageIcon className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={toggle}
      title={isPixel ? "Arte: Pixel (clique para original)" : "Arte: Original (clique para pixel)"}
      aria-label={isPixel ? "Usar arte original" : "Usar pixel art"}
    >
      {isPixel ? (
        <Grid3x3 className="size-4" />
      ) : (
        <ImageIcon className="size-4" />
      )}
    </Button>
  );
}
