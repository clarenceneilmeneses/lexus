import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Landing-page motion system (GSAP). Everything runs inside a
 * prefers-reduced-motion matchMedia, so reduced-motion users simply get the
 * static page — no element is ever hidden by CSS, only by GSAP at runtime.
 */
export function useHomeMotion(scope: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    let killed = false;

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        /* ---- hero intro ---------------------------------------------- */
        // Hide before first paint; the fonts.ready timeline brings it in.
        gsap.set(".hero-eyebrow", { autoAlpha: 0, y: 14 });
        gsap.set(".hero-title", { autoAlpha: 0 });
        gsap.set([".hero-sub", ".hero-ctas"], { autoAlpha: 0, y: 18 });

        // Split after webfonts load so DM Sans's metrics set the line breaks —
        // but never let a slow or blocked font request strand the hero at
        // opacity 0. Whichever settles first wins.
        Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 1500)),
        ]).then(() => {
          if (killed) return;
          const split = SplitText.create(".hero-title", { type: "lines", mask: "lines" });
          gsap
            // Restore the untouched heading afterwards — the line masks would
            // otherwise clip DM Sans's descenders at this tight line-height.
            .timeline({ defaults: { ease: "power3.out" }, onComplete: () => split.revert() })
            .to(".hero-eyebrow", { autoAlpha: 1, y: 0, duration: 0.6 })
            .set(".hero-title", { autoAlpha: 1 }, "<+=0.1")
            .from(split.lines, { yPercent: 115, duration: 1.05, stagger: 0.11, ease: "power4.out" }, "<")
            .to(".hero-sub", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.55")
            .to(".hero-ctas", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5");
        });

        /* ---- hero media: slow Ken Burns drift, as on the reference ---- */
        gsap.fromTo(
          ".hero-media",
          { scale: 1.06 },
          { scale: 1.16, duration: 22, ease: "power1.out" },
        );

        /* ---- stat count-ups ------------------------------------------ */
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = parseFloat(el.dataset.count ?? "");
          // Counting a year up from zero looks silly — only animate small figures.
          if (!isFinite(target) || target >= 1000) return;
          const state = { v: 0 };
          el.textContent = "0";
          gsap.to(state, {
            v: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            onUpdate() {
              el.textContent = Math.round(state.v).toLocaleString("en-US");
            },
          });
        });

        /* ---- story band: words surface as you read past -------------- */
        if (document.querySelector(".story-body p")) {
          const words = SplitText.create(".story-body p", { type: "words" });
          gsap.set(words.words, { opacity: 0.14 });
          gsap.to(words.words, {
            opacity: 1,
            ease: "none",
            stagger: 0.05,
            scrollTrigger: { trigger: ".story-body", start: "top 78%", end: "bottom 55%", scrub: true },
          });
        }

        /* ---- card grids: staggered rise ------------------------------ */
        gsap.utils.toArray<HTMLElement>(".stagger-grid").forEach((grid) => {
          const items = Array.from(grid.children) as HTMLElement[];
          if (!items.length) return;
          gsap.set(items, { y: 28, autoAlpha: 0 });
          ScrollTrigger.batch(items, {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 }),
          });
        });
      }, scope);

      return () => ctx.revert();
    });

    return () => {
      killed = true;
      mm.revert();
    };
  }, [scope]);
}
