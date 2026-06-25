import { useEffect, useRef } from "react";

/**
 * Subtle vertical parallax. Attach the returned ref to an over-sized image that
 * lives inside an `overflow-hidden` container; it translates as the container
 * scrolls through the viewport. Respects `prefers-reduced-motion`.
 *
 * @param speed 0.1–0.4 feels natural (fraction of scroll distance).
 */
export function useParallax<T extends HTMLElement = HTMLImageElement>(speed = 0.18) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // signed distance of the element's centre from the viewport centre
      const offset = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}
