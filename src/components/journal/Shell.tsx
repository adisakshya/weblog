import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { PrefsMenu } from "./PrefsMenu";

// Exact public destinations (unchanged from the published footer and masthead).
const PERSONAL_SITE = "https://adisakshya.github.io/";
const LINKEDIN = "https://www.linkedin.com/in/adisakshya/";
const TWITTER = "https://twitter.com/adisakshya";
const GITHUB = "https://github.com/adisakshya";
const SOURCE = "https://github.com/adisakshya/weblog";

const EXTERNAL = { rel: "noopener noreferrer" } as const;
const BUTTON = "inline-flex items-center text-sm font-medium";

// The header condenses once the page is scrolled past CONDENSE_AT and is restored only when back within RESTORE_AT. The gap is
// larger than the height the header gains or loses, so the change of its own height can never flip the state back (no jitter).
const CONDENSE_AT = 64;
const RESTORE_AT = 8;

/** Pinned header state: `condensed` follows the scroll position with hysteresis, and the header's rendered height is published
 *  as --j-header-h (CSS scroll-padding uses it so anchors and keyboard focus never land underneath the pinned header). */
function useCondensedHeader() {
  const ref = useRef<HTMLElement>(null);
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = window.scrollY;
      setCondensed((c) => (c ? y > RESTORE_AT : y > CONDENSE_AT));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    const el = ref.current;
    const root = document.documentElement;
    const publish = () => {
      if (el) root.style.setProperty("--j-header-h", `${el.getBoundingClientRect().height}px`);
    };
    // The CSS carries the full header height per breakpoint, so a direct load on /page#section is already placed below the pinned
    // header. When the real header differs (for example the controls wrapped because the web fonts are unavailable) place the
    // target again with the real height.
    const assumed = parseFloat(getComputedStyle(root).getPropertyValue("--j-header-h"));
    publish();
    const actual = el?.getBoundingClientRect().height ?? assumed;
    if (location.hash.length > 1 && Math.abs(actual - assumed) > 0.5) {
      let target: HTMLElement | null = null;
      try {
        target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      } catch {
        /* a malformed hash has no target */
      }
      target?.scrollIntoView({ block: "start" });
    }
    const ro = el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(publish) : null;
    if (el && ro) ro.observe(el);
    return () => {
      window.removeEventListener("scroll", onScroll);
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return { ref, condensed };
}

export function Shell({ children }: { children: ReactNode }) {
  const { ref, condensed } = useCondensedHeader();
  return (
    <div className="journal j-shell">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 j-btn"
      >
        Skip to content
      </a>
      <header ref={ref} className="j-header" data-condensed={condensed ? "true" : undefined}>
        <div className="j-header-inner">
          <Link to="/" className="plain j-masthead min-w-0">
            The blog of Adisakshya Chauhan
          </Link>
          <div className="j-header-actions">
            <nav aria-label="Primary" className="min-w-0">
              <a
                href={PERSONAL_SITE}
                {...EXTERNAL}
                className={`j-btn j-meet justify-center gap-2 ${BUTTON}`}
              >
                Meet Adi <ArrowUpRight aria-hidden="true" size={16} />
              </a>
            </nav>
            <div className="j-header-tools">
              <SearchDialog />
              <PrefsMenu />
            </div>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="j-footer">
        <div className="j-footer-inner">
          <div className="j-footer-top">
            <section aria-labelledby="follow-adi" className="j-footer-group">
              <h2 id="follow-adi" className="j-footer-label">
                Follow Adi
              </h2>
              <nav aria-label="Follow Adi" className="j-footer-links">
                <a href={LINKEDIN} {...EXTERNAL} className="j-footer-primary">
                  <Linkedin aria-hidden="true" /> LinkedIn <ArrowUpRight aria-hidden="true" />
                </a>
                <a href={TWITTER} {...EXTERNAL} className="j-footer-pill j-footer-x">
                  Twitter/X <ArrowUpRight aria-hidden="true" />
                </a>
                <a href={GITHUB} {...EXTERNAL} className="j-footer-pill j-footer-gh">
                  <Github aria-hidden="true" /> GitHub <ArrowUpRight aria-hidden="true" />
                </a>
              </nav>
            </section>
            <section aria-labelledby="footer-explore" className="j-footer-group">
              <h2 id="footer-explore" className="j-footer-label">
                Explore
              </h2>
              <nav aria-label="Explore" className="j-footer-links">
                <Link className="j-footer-link" to="/">
                  Home
                </Link>
                <Link className="j-footer-link" to="/" search={{ view: "subjects" }}>
                  Subjects
                </Link>
                <Link className="j-footer-link" to="/" search={{ view: "index" }}>
                  Index
                </Link>
              </nav>
            </section>
          </div>
          <div className="j-footer-meta">
            <p>
              <span>
                © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Adisakshya
                Chauhan
              </span>
            </p>
            <p>
              <span>
                Made with love.{" "}
                <a href={SOURCE} {...EXTERNAL}>
                  Open source
                </a>
                .
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
