const menuButton = document.querySelector("[data-menu]");
const sidebar = document.querySelector("[data-sidebar]");
const backdrop = document.querySelector("[data-backdrop]");

function closeMenu() {
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuButton.setAttribute("aria-expanded", String(open));
});
backdrop?.addEventListener("click", closeMenu);
sidebar?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.querySelectorAll("[data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-block")?.querySelector("code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = "Copy"; }, 1400);
    } catch {
      button.textContent = "Select code";
    }
  });
});

const tocLinks = [...document.querySelectorAll(".page-toc a[href^='#']")];
const sections = tocLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
if (sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!active) return;
    tocLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${active.target.id}`));
  }, { rootMargin: "-18% 0px -70%", threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
