import {
  Layers,
  Grid3x3,
  DoorClosed,
  Sparkles,
  Disc,
  TreePine,
  Bath,
  Triangle,
  Frame,
  Columns3,
  PanelTop,
  Package,
  type LucideIcon,
} from "lucide-react";

/** Maps a category slug to a Lucide glyph. Ordered most-specific first, since
 *  slugs overlap (e.g. "acoustic-ceiling" would match both ceiling and panel). */
const RULES: [test: string, icon: LucideIcon][] = [
  ["scaffold", Frame],
  ["steel", Columns3],
  ["ceiling", Grid3x3],
  ["acoustic", Grid3x3],
  ["drywall", Grid3x3],
  ["door", DoorClosed],
  ["gloss", Sparkles],
  ["kiiltava", Sparkles],
  ["compact", Sparkles],
  ["edgeband", Disc],
  ["veneer", TreePine],
  ["toilet", Bath],
  ["plaster", Triangle],
  ["melamine", Layers],
  ["mdf", Layers],
  ["phenolic", Layers],
  ["gypsum", PanelTop],
  ["fiber", PanelTop],
  ["cement", PanelTop],
];

export default function CategoryIcon({ slug, className = "" }: { slug: string; className?: string }) {
  const s = slug || "";
  const Icon = RULES.find(([test]) => s.includes(test))?.[1] ?? Package;
  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />;
}
