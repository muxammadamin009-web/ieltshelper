import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router's <Link> intercepts clicks and uses history.pushState, which
// — unlike a real browser navigation — does NOT auto-scroll to a URL hash
// target. Without this, every `to="/#pricing"` link in the app (footer,
// Dashboard's "Subscribe" banner, Profile, Writing) would silently land at
// the top of the page instead of the pricing section. This fixes that
// globally, once, instead of hand-rolling scroll logic per page.
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    // Give the new page a tick to render before we look for the target.
    const id = hash.replace('#', '');
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
    return () => clearTimeout(timer);
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
