import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SearchDialog } from "./SearchDialog";
import { PrefsMenu } from "./PrefsMenu";

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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="plain j-masthead text-2xl sm:text-[1.7rem] mr-auto">
            The blog of Adisakshya Chauhan
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1 text-sm">
            <a
              href="https://adisakshya.github.io/"
              className="plain rounded-full px-3 py-1.5 hover:bg-[var(--j-panel)]"
            >
              Meet Adi
            </a>
          </nav>
          <div className="flex items-center gap-1.5">
            <SearchDialog />
            <PrefsMenu />
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="mt-20 border-t j-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/">Home</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/terms">Terms &amp; policies</Link>
            <a href="https://twitter.com/adisakshya">Twitter</a>
            <a href="https://github.com/adisakshya">GitHub</a>
            <a href="https://www.linkedin.com/in/adisakshya/">LinkedIn</a>
            <a href="mailto:adisakshya98@gmail.com">Email</a>
          </nav>
          <p className="j-muted">
            © {new Date().getFullYear()} Adisakshya Chauhan · Built in New Delhi, India (
            <a href="https://github.com/adisakshya/weblog">view source</a>)
          </p>
        </div>
      </footer>
    </div>
  );
}
