import { useEffect, useState } from "react";
import { useMatches } from "@tanstack/react-router";
import * as Popover from "@radix-ui/react-popover";
import {
  THEMES,
  SIZES,
  WIDTHS,
  readPrefs,
  applyPrefs,
  applyPrefsToDocument,
  DEFAULT_PREFS,
  type Prefs,
} from "@/lib/prefs";

const ARTICLE_ROUTE_ID = "/_site/$year/$month/$day/$file";

export function PrefsMenu() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [storageOk, setStorageOk] = useState(true);
  // Text size and Article width only mean something on an individual article, so they are offered only there: the route must be
  // the article route AND its match must have resolved to an article (an unknown article URL is a not-found match, not "success").
  // Saved size/width still apply to the document everywhere, so they are there when the reader returns to an article.
  const onArticle = useMatches({
    select: (ms) => ms.some((m) => m.routeId === ARTICLE_ROUTE_ID && m.status === "success"),
  });
  useEffect(() => {
    // The boot script already applied the stored choices before first paint; apply the validated ones again so the page and
    // the menu always agree (an unknown stored value becomes the default in both), without writing storage.
    const saved = readPrefs();
    setPrefs(saved);
    applyPrefsToDocument(saved);
  }, []);
  useEffect(() => {
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyPrefs(prefs);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [prefs]);
  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setStorageOk(applyPrefs(next));
  };
  const group = (
    legend: string,
    name: keyof Prefs,
    items: readonly { id: string; label: string }[],
  ) => (
    <fieldset className="mt-3 first:mt-0">
      <legend className="text-xs font-semibold uppercase tracking-wider j-muted mb-1.5">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <label
            key={i.id}
            className="j-ghost j-pref-choice text-sm inline-flex items-center gap-1.5"
          >
            <input
              type="radio"
              name={name}
              value={i.id}
              checked={prefs[name] === i.id}
              onChange={() => update({ [name]: i.id })}
            />
            {name === "theme" && <Swatch id={i.id} />}
            {i.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <Popover.Root>
      <Popover.Trigger className="j-ghost j-header-tool inline-flex items-center text-sm font-medium">
        <span aria-hidden="true" className="font-semibold">
          Aa
        </span>{" "}
        Appearance
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          aria-label="Appearance"
          tabIndex={0}
          className="journal j-appearance z-50 w-[min(22rem,calc(100vw-1.5rem))] !min-h-0 rounded-lg border j-border p-4 shadow-xl"
        >
          <h2 className="font-semibold mb-3">Appearance</h2>
          {group("Theme", "theme", THEMES)}
          {onArticle && group("Text size", "size", SIZES)}
          {onArticle && group("Article width", "width", WIDTHS)}
          {!storageOk && (
            <p role="status" className="mt-3 text-sm j-muted">
              Your browser isn’t saving preferences, so they apply to this page only.
            </p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Palette preview: tokens are read by scoping data-theme onto the swatch itself. */
function Swatch({ id }: { id: string }) {
  const dot = (t: string) => <span data-theme={t} className="j-theme-swatch" />;
  if (id === "system")
    return (
      <span aria-hidden="true" className="inline-flex -space-x-1.5">
        {dot("original")}
        {dot("dark-modern")}
      </span>
    );
  return <span aria-hidden="true">{dot(id)}</span>;
}
