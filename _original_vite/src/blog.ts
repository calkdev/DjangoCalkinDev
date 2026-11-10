import "./styles/main.scss";
import "./styles/blog.scss";

// Same theme + burger behaviour as the homepage, minus the sections.
function initTheme(): void {
  const toggle = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);

  toggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme: string): void {
  const icon = document.querySelector("#theme-toggle .icon i");
  if (icon) {
    icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }
}

function initNavbar(): void {
  const burger = document.querySelector(".navbar-burger");
  const target = document.getElementById(burger?.getAttribute("data-target") || "");
  burger?.addEventListener("click", () => {
    burger.classList.toggle("is-active");
    target?.classList.toggle("is-active");
  });
}

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

async function loadPosts(): Promise<void> {
  const list = document.getElementById("post-list");
  if (!list) return;

  let posts: PostMeta[] = [];
  try {
    const res = await fetch("/blog/posts.json");
    if (!res.ok) throw new Error(String(res.status));
    posts = await res.json();
  } catch {
    list.innerHTML = '<p class="has-text-grey">Couldn\'t load posts — try refreshing.</p>';
    return;
  }

  if (!posts.length) {
    list.innerHTML = '<p class="has-text-grey">No posts yet — check back soon.</p>';
    return;
  }

  list.innerHTML = posts
    .map(
      (p) => `
      <a class="post-row" href="/blog/${p.slug}/">
        <div class="post-row-main">
          <h2 class="post-row-title">${escapeHtml(p.title)}</h2>
          <p class="post-row-desc">${escapeHtml(p.description)}</p>
          <div class="tags post-tags">
            ${p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
        <p class="post-row-meta">${formatDate(p.date)}<br />${p.readingTime}</p>
      </a>`
    )
    .join("");
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbar();
  loadPosts();
});
