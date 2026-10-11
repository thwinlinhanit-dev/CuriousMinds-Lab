#!/usr/bin/env node
// Link health monitor: checks every external lab URL in the database.
// - phet-embed  -> https://phet.colorado.edu/sims/html/{slug}/latest/embed
// - embed-lab   -> url from default_config JSON
// In-app simulations have no external dependency and are skipped.
//
// Usage:
//   node scripts/check-links.mjs            # full report to console + data/link-report.json
//   node scripts/check-links.mjs --strict   # exit code 1 if any dead links (for CI)
//   node scripts/check-links.mjs --only=dead # re-check only previously-dead links

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "curious-minds.db");
const REPORT_PATH = path.join(process.cwd(), "data", "link-report.json");
const STRICT = process.argv.includes("--strict");
const ONLY_ARG = process.argv.find((a) => a.startsWith("--only="));
const ONLY = ONLY_ARG ? ONLY_ARG.split("=")[1] : null;
const CONCURRENCY = 6;
const TIMEOUT_MS = 15000;

function collectTargets() {
  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare("SELECT id, title, subject_id, simulation_type, default_config FROM modules").all();
  db.close();
  const targets = [];
  const seen = new Map(); // url -> moduleId (first module wins, report lists all ids sharing it)
  for (const r of rows) {
    let url = null;
    let cfg = {};
    try { cfg = JSON.parse(r.default_config ?? "{}"); } catch {}
    if (r.simulation_type === "phet-embed" && cfg.slug) {
      url = `https://phet.colorado.edu/sims/html/${cfg.slug}/latest/${cfg.slug}_en.html`;
    } else if (r.simulation_type === "embed-lab" && cfg.url) {
      url = cfg.url;
    }
    if (!url) continue;
    if (seen.has(url)) { seen.get(url).moduleIds.push(r.id); continue; }
    seen.set(url, { url, title: r.title, subjectId: r.subject_id, moduleIds: [r.id] });
  }
  targets.push(...seen.values());
  return targets;
}

const prevReport = (() => {
  try { return JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8")); } catch { return { checkedAt: null, results: [] }; }
})();

async function checkOne(t) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const result = { ...t, checkedAt: new Date().toISOString(), status: "error", httpStatus: null, frameBlocked: false, error: null };
  try {
    // Many sites reject HEAD; use GET with a byte cap via abort after headers.
    const res = await fetch(t.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (link-health-check; CuriousMindsLab)" },
    });
    result.httpStatus = res.status;
    // Close the body immediately — we only needed the headers.
    try { await res.body?.cancel(); } catch {}
    const xfo = (res.headers.get("x-frame-options") ?? "").toLowerCase();
    const csp = (res.headers.get("content-security-policy") ?? "").toLowerCase();
    const frameBlocked = xfo.includes("deny") || xfo.includes("sameorigin") || (csp.includes("frame-ancestors") && !csp.includes("frame-ancestors *"));
    result.frameBlocked = frameBlocked;
    if (res.status >= 200 && res.status < 400) result.status = frameBlocked ? "frame-blocked" : "ok";
    else result.status = "dead";
  } catch (e) {
    result.error = String(e?.cause?.code ?? e?.name ?? e).slice(0, 80);
    result.status = "dead";
  } finally {
    clearTimeout(timer);
  }
  return result;
}

async function runPool(items, worker) {
  const out = [];
  let i = 0;
  async function lane() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx]);
      process.stdout.write(`\r${idx + 1}/${items.length} checked`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, lane));
  process.stdout.write("\n");
  return out;
}

const allTargets = collectTargets();
let targets = allTargets;
if (ONLY === "dead") {
  const deadUrls = new Set((prevReport.results ?? []).filter((r) => r.status === "dead").map((r) => r.url));
  targets = allTargets.filter((t) => deadUrls.has(t.url));
  console.log(`Re-checking ${targets.length} previously-dead of ${allTargets.length} URLs...`);
} else {
  console.log(`Checking ${targets.length} external URLs (${allTargets.length ? "deduped" : "none"})...`);
}
if (targets.length === 0) { console.log("Nothing to check. ✅"); process.exit(0); }

const results = await runPool(targets, checkOne);
const ok = results.filter((r) => r.status === "ok");
const blocked = results.filter((r) => r.status === "frame-blocked");
const dead = results.filter((r) => r.status === "dead");

console.log(`\n✅ OK: ${ok.length}`);
console.log(`⚠️  Frame-blocked (page live, may not embed): ${blocked.length}`);
for (const r of blocked) console.log(`   ${r.httpStatus} ${r.url} [${r.moduleIds.join(", ")}]`);
console.log(`❌ Dead: ${dead.length}`);
for (const r of dead) console.log(`   ${r.httpStatus ?? r.error} ${r.url} [${r.moduleIds.join(", ")}] "${r.title}"`);

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify({ checkedAt: new Date().toISOString(), total: results.length, ok: ok.length, frameBlocked: blocked.length, dead: dead.length, results }, null, 2));
console.log(`\nReport saved to ${path.relative(process.cwd(), REPORT_PATH)}`);

if (STRICT && dead.length > 0) {
  console.error(`\n--strict: ${dead.length} dead link(s) found.`);
  process.exit(1);
}
