import { useEffect, useRef, useState } from "react";

// Enhances rendered Markdown: copy buttons on code blocks and click-to-enlarge images.
// Jekyll handoff: assets/js/copy-code.js and assets/js/lightbox.js.
export function ArticleBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLDivElement>(".code-block").forEach((block) => {
      if (block.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy code to clipboard");
      btn.addEventListener("click", async () => {
        const code = block.querySelector("code")?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          btn.textContent = "Copied";
        } catch {
          btn.textContent = "Copy failed – select manually";
        }
        btn.setAttribute("aria-live", "polite");
        setTimeout(() => (btn.textContent = "Copy"), 2000);
      });
      block.appendChild(btn);
    });
    const onClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest("img.zoomable") as HTMLImageElement | null;
      if (!img) return;
      lastFocus.current = document.activeElement as HTMLElement;
      setZoom({ src: img.src, alt: img.alt });
    };
    root.addEventListener("click", onClick);
    root.querySelectorAll("img.zoomable").forEach((img) => {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Enlarge image: ${img.getAttribute("alt")}`);
      img.addEventListener("keydown", (e) => {
        const k = (e as KeyboardEvent).key;
        if (k === "Enter" || k === " ") {
          e.preventDefault();
          (img as HTMLElement).click();
        }
      });
    });
    return () => root.removeEventListener("click", onClick);
  }, [html]);

  useEffect(() => {
    if (!zoom) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus();
    };
  }, [zoom]);

  return (
    <>
      <div ref={ref} className="prose-j" dangerouslySetInnerHTML={{ __html: html }} />
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image"
          className="fixed inset-0 z-50 grid place-items-center p-4"
          style={{ background: "var(--j-overlay)" }}
          onClick={() => setZoom(null)}
        >
          <img
            src={zoom.src}
            alt={zoom.alt}
            className="max-h-[88vh] max-w-full rounded-lg"
            style={{ background: "#fff" }}
          />
          <button
            ref={closeRef}
            type="button"
            className="j-btn fixed right-4 top-4"
            onClick={() => setZoom(null)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
