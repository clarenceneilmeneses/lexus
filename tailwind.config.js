/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Lexus brand navy #232c6d — sampled from the logo. The single accent
        // colour across the whole system (headings, dark sections, actions).
        ink: { DEFAULT: "#232c6d", 2: "#2E3884", 3: "#181E52" },
        steel: { DEFAULT: "#5B6573", 2: "#9AA1B8" },
        line: { DEFAULT: "#E4E7EC", 2: "#EEF0F3" },
        // Primary brand / actions — the brand navy, with a lighter `glow` tint
        // for accents sitting on dark/navy backgrounds.
        brand: { DEFAULT: "#232c6d", d: "#1A2052", soft: "#E7EAF6", glow: "#4D58A8" },
        // Accent — same brand navy; `glow` is the lighter periwinkle for accents
        // on dark/navy backgrounds (photos, the admin sidebar).
        accent: { DEFAULT: "#232c6d", d: "#1A2052", soft: "#E6E8F6", glow: "#AAB2E2" },
        // Red — logo star accent
        flag: "#EA492E",
        paper: "#F4F5F7",
        sand: "#F7F8FB",
        // Light corporate palette (landing page)
        corp: {
          // Slightly deeper than white so the light/white section alternation
          // is actually visible on cheap panels.
          bg: "#f3f4f8",
          navy: "#232c6d",
          navyD: "#1A2052",
          // Accent key (kept the `orange` name so existing `corp-orange`
          // classes flip site-wide at once) — now the brand navy.
          orange: "#232c6d",
          orangeD: "#1A2052",
          soft: "#E3E5F6",
          grey: "#6D6D6D",
        },
        // Editorial reference palette (multi-line.com.ph design language), with
        // its indigo family mapped onto the Lexus brand navy and its teal
        // accent replaced by the logo's flag red. `band` is the dark section
        // colour, `accent` the single action colour.
        ref: {
          ink: "#0e0e23",     // headings
          body: "#444444",    // body copy
          band: "#232c6d",    // dark band (reference: #39397f)
          bandD: "#1B2255",
          accent: "#EA492E",  // actions (reference: #00857d)
          accentD: "#CE3B22",
          off: "#f9f9fb",     // alternating light section
          grey: "#f2f3f5",    // tertiary light section
          hair: "#e4e4e4",    // hairline rules
        },
      },
      // One type system, matching the panel: DM Sans for everything, DM Mono for
      // numerics (IDs, timestamps, coordinates, stat values, micro-labels).
      // `display`/`body`/`ui`/`serif` are kept as aliases of DM Sans so the
      // existing `font-*` usage across the app resolves without a rewrite.
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"DM Sans"', "system-ui", "sans-serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
        ui: ['"DM Sans"', "system-ui", "sans-serif"],
        serif: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"DM Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { DEFAULT: "4px" },
      maxWidth: { content: "1200px", band: "1300px", cards: "1250px" },
      boxShadow: {
        card: "0 1px 2px rgba(35,44,109,.04), 0 12px 30px -22px rgba(35,44,109,.45)",
        lift: "0 18px 44px -24px rgba(35,44,109,.55)",
        glow: "0 14px 40px -16px rgba(35,44,109,.55)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(.22,1,.36,1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "menu-in": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        // Slow Ken Burns drift on the hero media, as on the reference slideshow.
        kenburns: {
          from: { transform: "scale(1.06)" },
          to: { transform: "scale(1.16)" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.22,1,.36,1) both",
        marquee: "marquee 34s linear infinite",
        "menu-in": "menu-in .18s cubic-bezier(.22,1,.36,1) both",
        kenburns: "kenburns 22s ease-out both",
      },
    },
  },
  plugins: [],
};
