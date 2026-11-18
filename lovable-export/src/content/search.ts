import type { SearchDoc } from "./content";

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9#+.\-\s]/g, " ").replace(/\s+/g, " ").trim();

export type SearchHit = { doc: SearchDoc; score: number; snippet: string };

export function search(index: SearchDoc[], query: string): SearchHit[] {
  const terms = norm(query).split(" ").filter(Boolean);
  if (!terms.length) return [];
  const hits: SearchHit[] = [];
  for (const doc of index) {
    const title = norm(doc.title), summary = norm(doc.summary), tags = norm(doc.tags.join(" ")), body = norm(doc.body);
    let score = 0;
    let ok = true;
    for (const t of terms) {
      const s = (title.includes(t) ? 10 : 0) + (tags.includes(t) ? 6 : 0) + (summary.includes(t) ? 4 : 0) + (body.includes(t) ? 1 : 0);
      if (!s) { ok = false; break; } // all terms must match (AND)
      score += s;
    }
    if (!ok) continue;
    if (title.includes(terms.join(" "))) score += 30; // whole-phrase title match
    hits.push({ doc, score, snippet: snippet(doc, terms) });
  }
  return hits.sort((a, b) => b.score - a.score);
}

function snippet(doc: SearchDoc, terms: string[]) {
  const src = doc.body || doc.summary;
  const low = src.toLowerCase();
  const i = terms.map((t) => low.indexOf(t)).filter((n) => n >= 0).sort((a, b) => a - b)[0];
  if (i === undefined || norm(doc.title + " " + doc.summary).includes(terms[0] ?? "")) return doc.summary || src.slice(0, 160);
  const start = Math.max(0, i - 60);
  return (start ? "…" : "") + src.slice(start, start + 170).trim() + "…";
}
