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
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
        // Editorial serif — used for the hero display title.
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      borderRadius: { DEFAULT: "4px" },
      maxWidth: { content: "1200px" },
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
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.22,1,.36,1) both",
        marquee: "marquee 34s linear infinite",
        "menu-in": "menu-in .18s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};
