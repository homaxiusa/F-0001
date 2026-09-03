# Homaxi Integration Hub

Static documentation published at `https://www.homaxi.us/integration/`.

## Current documents

- IP Speaker Integration Guide
- IP Speaker CGI-JSON API Reference

## Update the site

1. Add or update the Markdown file in `content/`.
2. Add its title, route, type, and summary to the `docs` array in `build-docs.mjs`.
3. Run:

```powershell
node .\integration\build-docs.mjs
```

The generator rebuilds the documentation index, article pages, navigation, and on-page table of contents. Commit the Markdown source and generated HTML together.
