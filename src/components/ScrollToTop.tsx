import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls to the top whenever the route (pathname) changes, unless the URL
 *  carries a hash (in-page anchor), which the browser handles itself. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}
