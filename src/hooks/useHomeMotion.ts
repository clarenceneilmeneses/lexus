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
        /* ---- scroll progress hairline -------------------------------- */
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
        });

        /* ---- hero intro ---------------------------------------------- */
        // Hide before first paint; the fonts.ready timeline brings it in.
        gsap.set(".hero-eyebrow", { autoAlpha: 0, y: 14 });
        gsap.set(".hero-title", { autoAlpha: 0 });
        gsap.set([".hero-sub", ".hero-ctas"], { autoAlpha: 0, y: 18 });
        gsap.set(".hero-video", { autoAlpha: 0 });
        gsap.set(".hero-stats", { autoAlpha: 0, y: 12 });

        // Split after webfonts load so Playfair's metrics set the line breaks.
        document.fonts.ready.then(() => {
          if (killed) return;
          const split = SplitText.create(".hero-title", { type: "lines", mask: "lines" });
          gsap
            // Restore the untouched heading afterwards — the line masks would
            // otherwise clip Playfair's descenders at this tight line-height.
            .timeline({ defaults: { ease: "power3.out" }, onComplete: () => split.revert() })
            .to(".hero-eyebrow", { autoAlpha: 1, y: 0, duration: 0.6 })
            .set(".hero-title", { autoAlpha: 1 }, "<+=0.1")
            .from(split.lines, { yPercent: 115, duration: 1.05, stagger: 0.11, ease: "power4.out" }, "<")
            .to(".hero-sub", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.55")
            .to(".hero-ctas", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
            .to(".hero-video", { autoAlpha: 1, duration: 0.9 }, "-=0.45")
            .to(".hero-stats", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.55");
        });

        /* ---- hero video: expand as it scrolls into place ------------- */
        gsap.fromTo(
          ".hero-video-frame",
          { scale: 0.94, borderRadius: 28 },
          {
            scale: 1,
            borderRadius: 0,
            ease: "none",
            scrollTrigger: { trigger: ".hero-video", start: "top 90%", end: "top 30%", scrub: 0.5 },
          },
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

        /* ---- services bento: slow parallax inside each card ---------- */
        gsap.utils.toArray<HTMLElement>(".svc-img").forEach((img) => {
          gsap.set(img, { scale: 1.16 });
          gsap.fromTo(
            img,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

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
