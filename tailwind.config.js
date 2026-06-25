/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Navy — Lexus brand dark (headings, dark sections, utility bar)
        ink: { DEFAULT: "#1D2565", 2: "#2A337A", 3: "#141A4D" },
        steel: { DEFAULT: "#5B6573", 2: "#9AA1B8" },
        line: { DEFAULT: "#E4E7EC", 2: "#EEF0F3" },
        // Royal blue — primary brand / actions
        brand: { DEFAULT: "#1D67CD", d: "#17539F", soft: "#E7F0FB", glow: "#3F86E6" },
        // Logo periwinkle — brand accent (eyebrows, underlines, highlights).
        // Sampled from the Lexus logo's blue. `glow` is the lighter tint for
        // accents sitting on dark/navy backgrounds (photos, the admin sidebar).
        accent: { DEFAULT: "#5560A8", d: "#3B447F", soft: "#E6E8F6", glow: "#AAB2E2" },
        // Red — logo mark accent
        flag: "#EA492E",
        paper: "#F4F5F7",
        sand: "#F7F8FB",
        // Light corporate palette (landing page) — mirrors the reference design
        corp: {
          bg: "#f9f9fb",
          navy: "#32327f",
          navyD: "#262366",
          // Accent retired from orange to the logo periwinkle (kept the key
          // name so existing `corp-orange` classes flip site-wide at once).
          orange: "#5560A8",
          orangeD: "#3B447F",
          soft: "#dbdbff",
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
        card: "0 1px 2px rgba(29,37,101,.04), 0 12px 30px -22px rgba(29,37,101,.45)",
        lift: "0 18px 44px -24px rgba(29,37,101,.55)",
        glow: "0 14px 40px -16px rgba(29,103,205,.55)",
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
