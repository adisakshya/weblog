import type { ReactNode } from "react";
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
const EMAIL = "mailto:adisakshya98@gmail.com";

const EXTERNAL = { rel: "noopener noreferrer" } as const;
const BUTTON = "inline-flex items-center text-sm font-medium";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="journal j-shell">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 j-btn"
      >
        Skip to content
      </a>
      <header className="border-b j-border">
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
      <footer className="j-footer mt-20 border-t j-border">
        <div className="j-footer-inner">
          <div className="j-footer-top">
            <section aria-labelledby="follow-adi">
              <h2 id="follow-adi" className="text-2xl font-semibold">
                Follow Adi
              </h2>
              <nav aria-label="Follow Adi" className="j-social-links">
                <a href={LINKEDIN} {...EXTERNAL} className={`j-btn ${BUTTON}`}>
                  <Linkedin aria-hidden="true" size={16} /> LinkedIn{" "}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
                <a href={TWITTER} {...EXTERNAL} className={`j-ghost ${BUTTON}`}>
                  Twitter/X <ArrowUpRight aria-hidden="true" size={16} />
                </a>
                <a href={GITHUB} {...EXTERNAL} className={`j-ghost ${BUTTON}`}>
                  <Github aria-hidden="true" size={16} /> GitHub{" "}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </nav>
            </section>
            <nav aria-label="Footer" className="j-footer-groups">
              <div>
                <h2 className="text-xs font-semibold uppercase j-muted">Explore</h2>
                <Link to="/">Home</Link>
                <Link to="/" search={{ view: "subjects" }}>
                  Subjects
                </Link>
                <Link to="/" search={{ view: "index" }}>
                  Index
                </Link>
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase j-muted">Get in touch &amp; help</h2>
                <Link to="/contact">Contact</Link>
                <a href={EMAIL}>Email</a>
                <Link to="/terms">Terms &amp; policies</Link>
              </div>
            </nav>
          </div>
          <div className="j-footer-bottom text-xs j-muted">
            <p>
              © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Adisakshya Chauhan
            </p>
            <p>
              Built in New Delhi, India ·{" "}
              <a href={SOURCE} {...EXTERNAL}>
                View source
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
