import "./styles/main.scss";

// ── Theme Toggle ──
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

// ── Navbar Burger ──
function initNavbar(): void {
  const burger = document.querySelector(".navbar-burger");
  const target = document.getElementById(burger?.getAttribute("data-target") || "");
  burger?.addEventListener("click", () => {
    burger.classList.toggle("is-active");
    target?.classList.toggle("is-active");
  });
  // close the mobile menu after picking a section
  target?.querySelectorAll("a.nav-link").forEach((a) =>
    a.addEventListener("click", () => {
      burger?.classList.remove("is-active");
      target.classList.remove("is-active");
    })
  );
}

// ── Blog carousel ──
interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: string;
}

async function initBlogCarousel(): Promise<void> {
  const track = document.getElementById("blog-carousel");
  const section = document.getElementById("blog");
  if (!track || !section) return;

  let posts: PostMeta[] = [];
  try {
    const res = await fetch("/blog/posts.json");
    if (!res.ok) throw new Error(String(res.status));
    posts = await res.json();
  } catch {
    section.style.display = "none"; // no posts, no section
    return;
  }
  if (!posts.length) {
    section.style.display = "none";
    return;
  }

  track.innerHTML = posts
    .map(
      (p) => `
      <a class="blog-card" href="/blog/${p.slug}/">
        <p class="blog-card-date">${formatDate(p.date)} · ${p.readingTime}</p>
        <h3 class="blog-card-title">${escapeHtml(p.title)}</h3>
        <p class="blog-card-desc">${escapeHtml(p.description)}</p>
        <span class="blog-card-more">Read post →</span>
      </a>`
    )
    .join("");

  const prev = document.querySelector<HTMLButtonElement>(".carousel-prev");
  const next = document.querySelector<HTMLButtonElement>(".carousel-next");
  const step = (): number => {
    const card = track.querySelector<HTMLElement>(".blog-card");
    return card ? card.offsetWidth + 16 : 320;
  };
  prev?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));

  // gentle auto-advance; pauses while the pointer is over the track
  let paused = false;
  track.addEventListener("pointerenter", () => (paused = true));
  track.addEventListener("pointerleave", () => (paused = false));
  if (posts.length > 1) {
    setInterval(() => {
      if (paused || document.hidden) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: step(), behavior: "smooth" });
    }, 6000);
  }
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

// ── Contact Form ──
const CONTACT_ENDPOINT = "https://ourroom.calkindev.nz/api/portfolio-contact";

function initContactForm(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const textarea = form?.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null;
  const charCount = form?.querySelector(".char-count");
  const submitBtn = form?.querySelector(".submit-btn") as HTMLButtonElement | null;

  textarea?.addEventListener("input", () => {
    if (charCount) {
      charCount.textContent = `${textarea.value.length} / 2000 characters`;
    }
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("form-status");
    if (!status || !submitBtn) return;

    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const subject = (formData.get("subject") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();
    const website = (formData.get("website") as string)?.trim(); // honeypot

    const fail = (msg: string): void => {
      status!.style.display = "block";
      status!.className = "notification is-danger mt-3";
      status!.textContent = msg;
    };

    if (!name || !email || !message) {
      fail("Please fill in all required fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fail("Please enter a valid email address.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    status.style.display = "none";

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website }),
      });
      if (res.status === 429) {
        fail("Too many messages from this connection — please try again later.");
      } else if (!res.ok) {
        const j = await res.json().catch(() => null);
        fail(j?.error || "Something went wrong sending your message. Please try again.");
      } else {
        status.style.display = "block";
        status.className = "notification is-success mt-3";
        status.textContent = "Message sent! I'll get back to you soon.";
        form.reset();
        if (charCount) charCount.textContent = "0 / 2000 characters";
      }
    } catch {
      fail("Couldn't reach the server — please try again in a minute.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavbar();
  initContactForm();
  initBlogCarousel();
});
