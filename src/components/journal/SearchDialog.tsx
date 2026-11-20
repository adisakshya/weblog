import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import { searchIndex } from "@/content/content";
import { search } from "@/content/search";

const SUGGESTIONS = [
  { url: "/weblog/", title: "All writing", kind: "Page" },
  { url: "/weblog/series/api-gateway-101/", title: "API Gateway 101", kind: "Series" },
];

function isEditable(el: EventTarget | null) {
  const t = el as HTMLElement | null;
  return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const listRef = useRef<HTMLUListElement>(null);
  const hits = useMemo(() => search(searchIndex, q).slice(0, 12), [q]);
  const items = q.trim()
    ? hits.map((h) => ({
        url: h.doc.url,
        title: h.doc.title,
        kind: h.doc.kind,
        snippet: h.snippet,
      }))
    : SUGGESTIONS.map((s) => ({ ...s, snippet: "" }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (url: string) => {
    setOpen(false);
    // search URLs are full public paths (/weblog/...); the router works relative to its basepath
    navigate({ to: url.replace(/^\/weblog(?=\/|$)/, "") || "/" });
  };
  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      go(items[active].url);
    }
  };
  const activeId = items[active] ? `search-opt-${active}` : undefined;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQ("");
      }}
    >
      <Dialog.Trigger
        className="j-ghost j-header-tool inline-flex items-center text-sm font-medium"
        aria-keyshortcuts="/"
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="7" cy="7" r="5" />
          <path d="m11 11 4 4" />
        </svg>
        <span>Search</span>
        <kbd className="j-kbd hidden sm:inline" aria-hidden="true">
          /
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50" style={{ background: "var(--j-overlay)" }} />
        <Dialog.Content
          className="journal fixed left-1/2 top-[8vh] z-50 !min-h-0 w-[min(40rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border j-border shadow-2xl"
          style={{ background: "var(--j-bg)" }}
        >
          <Dialog.Title className="sr-only">Search the weblog</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type to search articles, series, topics and pages. Use the arrow keys to move through
            results, Enter to open, Escape to close.
          </Dialog.Description>
          <div className="flex items-center gap-2 border-b j-border p-3">
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="j-muted shrink-0"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="m11 11 4 4" />
            </svg>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="Search writing…"
              aria-label="Search"
              role="combobox"
              aria-expanded="true"
              aria-controls="search-results"
              aria-activedescendant={activeId}
              aria-autocomplete="list"
              className="min-w-0 flex-1 bg-transparent py-2 text-lg outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="j-ghost text-sm">
                Clear
              </button>
            )}
            <Dialog.Close className="j-ghost text-sm min-h-[2.25rem]" aria-label="Close search">
              Esc
            </Dialog.Close>
          </div>
          <p className="px-4 pt-3 text-xs j-muted" role="status" aria-live="polite">
            {q.trim()
              ? hits.length
                ? `${hits.length} result${hits.length === 1 ? "" : "s"}`
                : ""
              : "Suggestions"}
          </p>
          {q.trim() && !hits.length ? (
            <div className="px-4 pb-6 pt-2">
              <p className="font-semibold">No results for “{q}”</p>
              <p className="j-muted text-sm mt-1">
                Try fewer words, or a topic like kong, docker or vscode.
              </p>
            </div>
          ) : (
            <ul
              id="search-results"
              role="listbox"
              ref={listRef}
              aria-label="Search results"
              className="max-h-[60vh] overflow-y-auto p-2"
            >
              {items.map((it, i) => (
                <li
                  key={it.url}
                  id={`search-opt-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(it.url)}
                  className="cursor-pointer rounded-lg px-3 py-2.5"
                  style={
                    i === active
                      ? {
                          background: "var(--j-panel)",
                          color: "var(--j-panel-fg)",
                          boxShadow: "inset 3px 0 0 var(--j-accent)",
                        }
                      : undefined
                  }
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{it.title}</span>
                    <span className="text-xs j-muted shrink-0">{it.kind}</span>
                  </div>
                  {it.snippet && (
                    <p className="text-sm j-muted mt-0.5 line-clamp-2">{it.snippet}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
