(() => {
  const links = [...document.querySelectorAll('[data-toc] a')];
  const headings = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!headings.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-18% 0px -70% 0px' });

  headings.forEach((heading) => observer.observe(heading));
})();
