type IconProps = { className?: string };

/** Minimal stroked line glyphs — industrial / building-materials flavoured. */
const PATHS: Record<string, JSX.Element> = {
  // stacked panels / boards
  board: (
    <>
      <rect x="3" y="5" width="18" height="4" rx="1" />
      <rect x="3" y="11" width="18" height="4" rx="1" />
      <rect x="3" y="17" width="18" height="2" rx="1" />
    </>
  ),
  // scaffold frame
  frame: (
    <>
      <path d="M4 4v16M20 4v16M4 9h16M4 15h16" />
      <path d="M4 4l16 16M20 4L4 20" opacity=".5" />
    </>
  ),
  // steel stud (C profile)
  steel: (
    <>
      <path d="M16 4H6v16h10" />
      <path d="M6 12h7" />
    </>
  ),
  // grid / ceiling tiles
  grid: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 12h16M12 4v16" />
    </>
  ),
  // door
  door: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <circle cx="14.5" cy="12" r="1" />
    </>
  ),
  // gloss / shine panel
  gloss: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M8 16L16 8M11 18l6-6" opacity=".7" />
    </>
  ),
  // edge band tape (roll)
  tape: (
    <>
      <circle cx="9" cy="12" r="6" />
      <circle cx="9" cy="12" r="2" />
      <path d="M15 12h6" />
    </>
  ),
  // wood veneer (grain)
  wood: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M6 8c4 2 8 2 12 0M6 12c4 2 8 2 12 0M6 16c4 2 8 2 12 0" opacity=".7" />
    </>
  ),
  // toilet / fixtures
  fixture: (
    <>
      <path d="M7 4h10v6a5 5 0 01-10 0z" />
      <path d="M9 20h6M12 15v5" />
    </>
  ),
  // plaster / trowel
  plaster: (
    <>
      <path d="M4 14l9-9 5 5-9 9z" />
      <path d="M13 5l6 6" />
    </>
  ),
  // default cube
  cube: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M12 3v18M4 7.5l8 4.5 8-4.5" opacity=".6" />
    </>
  ),
};

function glyphFor(slug: string): JSX.Element {
  const s = slug || "";
  if (s.includes("scaffold")) return PATHS.frame;
  if (s.includes("steel")) return PATHS.steel;
  if (s.includes("ceiling") || s.includes("acoustic") || s.includes("drywall")) return PATHS.grid;
  if (s.includes("door")) return PATHS.door;
  if (s.includes("kiiltava") || s.includes("gloss") || s.includes("compact")) return PATHS.gloss;
  if (s.includes("edgeband")) return PATHS.tape;
  if (s.includes("veneer")) return PATHS.wood;
  if (s.includes("toilet")) return PATHS.fixture;
  if (s.includes("plaster")) return PATHS.plaster;
  if (s.includes("melamine") || s.includes("mdf") || s.includes("phenolic")) return PATHS.board;
  if (s.includes("gypsum") || s.includes("fiber") || s.includes("cement")) return PATHS.board;
  return PATHS.cube;
}

export default function CategoryIcon({ slug, className = "" }: { slug: string } & IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {glyphFor(slug)}
    </svg>
  );
}
