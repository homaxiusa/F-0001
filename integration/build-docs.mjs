import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1)));
const contentDir = path.join(root, "content");

const docs = [
  {
    source: "Homaxi_IP_Speaker_Integration_Guide_EN.md",
    slug: "ip-speaker/integration-guide",
    type: "Integration guide",
    title: "IP Speaker Integration Guide",
    summary: "Connect, authenticate, set volume, and play an on-device announcement through CGI-JSON.",
    readTime: "8 min read",
  },
  {
    source: "Homaxi_IP_Speaker_CGI_API_Reference_EN.md",
    slug: "ip-speaker/cgi-json-api-reference",
    type: "API reference",
    title: "IP Speaker CGI-JSON API Reference",
    summary: "Commands, body formats, request examples, fields, and response behavior for Homaxi IP Speakers.",
    readTime: "18 min read",
  },
];

const sourceFlag = process.argv.indexOf("--source");
if (sourceFlag >= 0) {
  const sourceDir = process.argv[sourceFlag + 1];
  if (!sourceDir) throw new Error("--source requires a directory");
  fs.mkdirSync(contentDir, { recursive: true });
  for (const doc of docs) {
    const source = fs.readFileSync(path.join(sourceDir, doc.source), "utf8");
    fs.writeFileSync(path.join(contentDir, doc.source), source.replace(/[ \t]+$/gm, ""));
  }
}

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const slugify = (value) => value
  .toLowerCase()
  .replace(/[`*_]/g, "")
  .replace(/&[a-z]+;/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "") || "section";

const rewriteHref = (href) => {
  if (href === "Homaxi_IP_Speaker_CGI_API_Reference_EN.md") return "/integration/ip-speaker/cgi-json-api-reference/";
  if (href === "Homaxi_IP_Speaker_Integration_Guide_EN.md") return "/integration/ip-speaker/integration-guide/";
  return href;
};

function inline(value) {
  const code = [];
  let result = value.replace(/`([^`]+)`/g, (_, token) => {
    code.push(`<code>${escapeHtml(token)}</code>`);
    return `\u0000CODE${code.length - 1}\u0000`;
  });
  result = escapeHtml(result)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => `<a href="${escapeHtml(rewriteHref(href))}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/\u0000CODE(\d+)\u0000/g, (_, index) => code[Number(index)]);
  return result;
}

function renderMarkdown(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const output = [];
  const toc = [];
  const ids = new Map();
  let i = 0;

  const uniqueId = (label) => {
    const base = slugify(label);
    const count = ids.get(base) || 0;
    ids.set(base, count + 1);
    return count ? `${base}-${count + 1}` : base;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { i += 1; continue; }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++]);
      i += 1;
      output.push(`<div class="code-block"><div class="code-label"><span>${escapeHtml(language || "text")}</span><button type="button" data-copy-code>Copy</button></div><pre><code>${escapeHtml(body.join("\n"))}</code></pre></div>`);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const label = heading[2].replace(/[`*_]/g, "");
      const id = uniqueId(label);
      if (level >= 2) toc.push({ level, label, id });
      output.push(`<h${level} id="${id}">${inline(heading[2])}<a class="heading-anchor" href="#${id}" aria-label="Link to ${escapeHtml(label)}">#</a></h${level}>`);
      i += 1;
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      output.push("<hr>");
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) quote.push(lines[i++].trim().replace(/^>\s?/, ""));
      output.push(`<blockquote>${quote.map((item) => `<p>${inline(item)}</p>`).join("")}</blockquote>`);
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[i + 1])) {
      const rows = [];
      const parseRow = (row) => row.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      const headers = parseRow(lines[i]);
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) rows.push(parseRow(lines[i++]));
      output.push(`<div class="table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].trim().replace(/^[-*]\s+/, ""));
      output.push(`<ul>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].trim().replace(/^\d+\.\s+/, ""));
      output.push(`<ol>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s|^```|^>|^-{3,}$|^[-*]\s+|^\d+\.\s+/.test(lines[i].trim()) && !(lines[i].includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-+/.test(lines[i + 1]))) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    output.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }
  return { html: output.join("\n"), toc };
}

const logo = `<a class="brand" href="/integration/" aria-label="Homaxi Integration Hub"><img src="/integration/assets/homaxi-logo.png" alt="Homaxi"><span>Developers</span></a>`;

function header(activeSlug) {
  const contactActive = activeSlug === "contact";
  return `<header class="topbar">${logo}<nav aria-label="Global navigation"><a class="${contactActive ? "" : "active"}" href="/integration/">Documentation</a><a class="${contactActive ? "active" : ""}" href="/integration/contact/">Contact</a></nav><button class="mobile-menu" type="button" data-menu aria-label="Open documentation menu"><span></span><span></span></button></header>`;
}

function sidebar(activeSlug = "") {
  return `<aside class="docs-sidebar" data-sidebar><a class="sidebar-home ${activeSlug === "" ? "current" : ""}" href="/integration/"><span class="home-icon">⌂</span>Documentation home</a><div class="sidebar-group"><p>IP Speaker</p>${docs.map((doc) => `<a class="${activeSlug === doc.slug ? "current" : ""}" href="/integration/${doc.slug}/">${doc.title.replace("IP Speaker ", "")}</a>`).join("")}</div><div class="sidebar-group sidebar-contact"><p>Support</p><a class="${activeSlug === "contact" ? "current" : ""}" href="/integration/contact/">Contact Homaxi</a></div><div class="sidebar-note"><strong>Need integration support?</strong><span>Include the device model, firmware, and a redacted request/response.</span><a href="/integration/contact/">Contact Homaxi →</a></div></aside>`;
}

function shell({ title, description, activeSlug = "", main, toc = "" }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | Homaxi Developers</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="https://www.homaxi.us/integration/${activeSlug ? `${activeSlug}/` : ""}"><link rel="icon" href="/integration/assets/favicon.svg"><link rel="stylesheet" href="/integration/assets/docs.css"></head>
<body>${header(activeSlug)}<div class="docs-frame">${sidebar(activeSlug)}<main class="docs-main">${main}</main>${toc}</div><div class="menu-backdrop" data-backdrop></div><script src="/integration/assets/docs.js" defer></script></body></html>`;
}

function renderIndex() {
  const cards = docs.map((doc, index) => `<a class="doc-card" href="/integration/${doc.slug}/"><span class="doc-card-icon">${index === 0 ? "↗" : "{ }"}</span><span class="doc-type">${doc.type}</span><h2>${doc.title}</h2><p>${doc.summary}</p><span class="doc-meta">English · v1.0 · ${doc.readTime}</span><span class="card-arrow">→</span></a>`).join("");
  const main = `<section class="hub-hero"><p class="eyebrow">HOMAXI INTEGRATION HUB</p><h1>Build with Homaxi.</h1><p class="hub-intro">Technical guides and API references for connecting Homaxi devices to monitoring, security, and automation workflows.</p><div class="quick-path"><span>Start here</span><a href="/integration/ip-speaker/integration-guide/">Integrate an IP Speaker <b>→</b></a></div></section><section class="library"><div class="section-title"><div><p class="eyebrow">DOCUMENT LIBRARY</p><h2>IP Speaker</h2></div><p>CGI-JSON integration over LAN, VPN, or an authorized backend bridge.</p></div><div class="doc-grid">${cards}</div></section><section class="principles"><p class="eyebrow">INTEGRATION PRINCIPLES</p><div><article><span>01</span><h3>Keep credentials server-side</h3><p>Device credentials belong in an authorized backend or integration bridge, never in a public browser client.</p></article><article><span>02</span><h3>Validate the complete path</h3><p>Confirm network reachability, firmware behavior, command responses, and the real operator workflow.</p></article><article><span>03</span><h3>Design for field evidence</h3><p>Log command names, status codes, and device errors while redacting all secrets.</p></article></div></section>`;
  return shell({ title: "Integration Documentation", description: "Homaxi integration guides and API references for monitoring partners, system integrators, and developers.", main });
}

function renderDoc(doc) {
  const markdown = fs.readFileSync(path.join(contentDir, doc.source), "utf8");
  const rendered = renderMarkdown(markdown);
  const toc = `<aside class="page-toc"><p>On this page</p>${rendered.toc.filter((item) => item.level <= 3).map((item) => `<a class="toc-${item.level}" href="#${item.id}">${escapeHtml(item.label)}</a>`).join("")}<a class="toc-top" href="#top">Back to top ↑</a></aside>`;
  const main = `<article class="doc-article" id="top"><div class="breadcrumbs"><a href="/integration/">Documentation</a><span>/</span><span>IP Speaker</span><span>/</span><strong>${doc.type}</strong></div><div class="doc-status"><span>${doc.type}</span><span>English</span><span>v1.0</span><span>Updated Sep 3, 2026</span></div>${rendered.html}<nav class="doc-pagination" aria-label="Document navigation">${doc.slug.includes("integration-guide") ? `<span></span><a href="/integration/ip-speaker/cgi-json-api-reference/"><small>Next</small>CGI-JSON API Reference →</a>` : `<a href="/integration/ip-speaker/integration-guide/"><small>Previous</small>← Integration Guide</a><span></span>`}</nav></article>`;
  return shell({ title: doc.title, description: doc.summary, activeSlug: doc.slug, main, toc });
}

function renderContact() {
  const main = `<section class="contact-page"><div class="contact-intro"><p class="eyebrow">CONTACT HOMAXI</p><h1>How can we help?</h1><p>For integration questions, technical documentation, or product support, contact the Homaxi team directly.</p></div><div class="contact-grid"><a class="contact-card contact-primary" href="mailto:support@homaxi.com"><span class="contact-label">Technical support</span><h2>support@homaxi.com</h2><p>Send your device model, firmware version, and a redacted request and response when asking about an integration.</p><strong>Email support →</strong></a><a class="contact-card" href="tel:+16269009818"><span class="contact-label">Phone</span><h2>+1 626 900 9818</h2><p>Call Homaxi for product and integration assistance.</p><strong>Call Homaxi →</strong></a><div class="contact-card"><span class="contact-label">Office</span><h2>Homaxi Inc.</h2><address>20653 Lycoming St, Unit A-1<br>Diamond Bar, CA 91789<br>United States</address><a class="map-link" href="https://www.google.com/maps/search/?api=1&amp;query=20653+Lycoming+St%2C+Unit+A-1%2C+Diamond+Bar%2C+CA+91789">View on map →</a></div></div><div class="contact-note"><span>Before contacting support</span><p>Never send passwords, API keys, or unredacted credentials. Include the command name, HTTP status, and device error code when available.</p></div></section>`;
  return shell({ title: "Contact", description: "Contact Homaxi for product integration, technical documentation, and support.", activeSlug: "contact", main });
}

fs.writeFileSync(path.join(root, "index.html"), renderIndex());
for (const doc of docs) {
  const directory = path.join(root, doc.slug);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "index.html"), renderDoc(doc));
}
const contactDir = path.join(root, "contact");
fs.mkdirSync(contactDir, { recursive: true });
fs.writeFileSync(path.join(contactDir, "index.html"), renderContact());
console.log(`Generated ${docs.length + 2} documentation pages.`);
