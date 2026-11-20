import { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  THEMES,
  FONTS,
  SIZES,
  WIDTHS,
  readPrefs,
  applyPrefs,
  applyPrefsToDocument,
  DEFAULT_PREFS,
  type Prefs,
} from "@/lib/prefs";

export function PrefsMenu() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [storageOk, setStorageOk] = useState(true);
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
          {group("Article font", "font", FONTS)}
          {group("Text size", "size", SIZES)}
          {group("Article width", "width", WIDTHS)}
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
