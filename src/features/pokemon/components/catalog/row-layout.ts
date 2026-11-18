/** Grid shared by list rows and the desktop column header. */
export const ROW_GRID =
  "grid grid-cols-[3.5rem_minmax(0,1fr)_auto] md:grid-cols-[4rem_minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,1.15fr)_repeat(7,minmax(0,0.44fr))]";

/** Row heights (px) used by the virtualizer; rows render at exactly this size. */
export const ROW_HEIGHT = { mobile: 76, desktop: 84 } as const;
export const ROW_GAP = 8;
