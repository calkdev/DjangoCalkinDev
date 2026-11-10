// Renders posts/*.md into static pages under public/blog/ plus a posts.json
// index that the homepage carousel and /blog.html read. Runs automatically
// before `npm run dev` and `npm run build` (see package.json pre-scripts).
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "posts");
const outDir = path.join(root, "public", "blog");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error("missing frontmatter block");
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pageHtml({ title, date, description, tags, readingTime: rt, bodyHtml }) {
  const niceDate = new Date(date + "T00:00:00").toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tagHtml = tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)} | CalkinDev Blog</title>
<meta name="description" content="${esc(description)}" />
<link rel="icon" type="image/png" href="/images/logo-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
:root{--bg:#0f1724;--card:#1e2d3d;--ink:#e0e0e0;--body:#a0aec0;--muted:#718096;--line:#2d3748;--accent:#7b93db;--tag-bg:#1a2740;--tag-text:#9fb2e0;--tag-border:#2b3c5e}
[data-theme="light"]{--bg:#f5f6f8;--card:#fff;--ink:#1a202c;--body:#4a5568;--muted:#718096;--line:#e2e8f0;--accent:#0e358a;--tag-bg:#eef2fb;--tag-text:#2c4485;--tag-border:#d4ddf0}
*{box-sizing:border-box}
body{margin:0;font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--ink)}
.wrap{max-width:720px;margin:0 auto;padding:2.5rem 1.5rem 4rem}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2.5rem}
.top a{display:flex;align-items:center;gap:.5rem;color:var(--ink);text-decoration:none;font-weight:500;font-style:italic}
.top img{width:26px;height:26px}
.top .back{font-style:normal;color:var(--muted);font-size:.9rem}
.top .back:hover{color:var(--accent)}
.meta{color:var(--muted);font-size:.85rem}
h1.post-title{font-size:2rem;font-weight:800;line-height:1.25;margin:.4rem 0 1rem}
.tags{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:2rem}
.tag{background:var(--tag-bg);color:var(--tag-text);border:1px solid var(--tag-border);border-radius:5px;font-size:.75rem;font-weight:500;padding:.25em .7em}
article{color:var(--body);line-height:1.75;font-size:1rem}
article h2{color:var(--ink);font-size:1.35rem;margin-top:2.2rem}
article h3{color:var(--ink);font-size:1.1rem;margin-top:1.8rem}
article a{color:var(--accent)}
article code{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:.1em .35em;font-size:.88em}
article pre{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:1rem;overflow-x:auto}
article pre code{background:none;border:none;padding:0}
article blockquote{border-left:3px solid var(--accent);margin:1.5rem 0;padding:.2rem 0 .2rem 1.2rem;color:var(--muted)}
article img{max-width:100%;border-radius:8px}
footer{margin-top:3.5rem;padding-top:1.5rem;border-top:1px solid var(--line);color:var(--muted);font-size:.85rem;display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
footer a{color:var(--accent);text-decoration:none}
</style>
</head>
<body>
<script>document.documentElement.setAttribute("data-theme",localStorage.getItem("theme")||"dark")</script>
<div class="wrap">
  <div class="top">
    <a href="/"><img src="/images/logo-icon.png" alt="" /><span>CalkinDev</span></a>
    <a class="back" href="/blog.html">← All posts</a>
  </div>
  <p class="meta">${niceDate} · ${rt}</p>
  <h1 class="post-title">${esc(title)}</h1>
  <div class="tags">${tagHtml}</div>
  <article>
${bodyHtml}
  </article>
  <footer>
    <span>© ${new Date().getFullYear()} CalkinDev</span>
    <a href="/#contact">Get in touch</a>
  </footer>
</div>
</body>
</html>
`;
}

const files = (await readdir(postsDir).catch(() => [])).filter((f) => f.endsWith(".md"));
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const index = [];
for (const file of files) {
  const raw = await readFile(path.join(postsDir, file), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, "");
  const post = {
    slug,
    title: meta.title || slug,
    date: meta.date || "1970-01-01",
    description: meta.description || "",
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
    readingTime: readingTime(body),
  };
  index.push(post);
  await mkdir(path.join(outDir, slug), { recursive: true });
  await writeFile(
    path.join(outDir, slug, "index.html"),
    pageHtml({ ...post, bodyHtml: marked.parse(body) })
  );
}

index.sort((a, b) => b.date.localeCompare(a.date));
await writeFile(path.join(outDir, "posts.json"), JSON.stringify(index, null, 2));
console.log(`blog: built ${index.length} post(s) → public/blog/`);
