"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";

/** Small pill shown while offline, and briefly when the connection returns. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const wasOffline = useRef(false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    // Announce reconnection after the browser event, then hide it.
    const show = setTimeout(() => setShowBackOnline(true), 0);
    const hide = setTimeout(() => setShowBackOnline(false), 2500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [online]);

  const visible = !online || showBackOnline;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-safe z-[70] flex justify-center px-4"
    >
      <AnimatePresence>
        {visible ? (
          <motion.div
            key={online ? "online" : "offline"}
            initial={{ y: 24, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="flex items-center gap-2 rounded-full border border-border/70 bg-popover/95 px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md"
          >
            {online ? (
              <>
                <Wifi className="size-4 text-success" />
                Back online
              </>
            ) : (
              <>
                <WifiOff className="size-4 text-brand" />
                You&apos;re offline · showing saved data
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
