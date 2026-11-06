# Static deployment

The website lives in `site/` and has no build command.

## GitHub Pages

Publish the `site` directory with your preferred Pages workflow. If Pages publishes the repository root instead, copy the contents of `site/` to the Pages branch root. Keep relative links intact.

## Cloudflare Pages

Set the project root directory to `site`, leave the build command empty, and use the output directory `.`. Cloudflare Pages reads `_headers` and `_redirects` from this directory.

The site is intentionally static: HTML, CSS, JavaScript, SVG, and PNG only. Every visible call-to-action points to an HTML page. The ZIP download is the only binary download action.
