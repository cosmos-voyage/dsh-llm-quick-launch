# Logo overrides

The panel resolves each brand mark in this order:

1. **Manual** — the site's own `iconUrl` set in the editor.
2. **Network** — `https://cdn.simpleicons.org/<slug>/ffffff`, kept in memory
   for the current session only. Covers ChatGPT, Claude, Gemini, Grok,
   Perplexity, Le Chat, DeepSeek, Kimi and Qwen.
3. **This folder** — `logos/<site-id>.svg` for ids listed in
   `logos/index.json` (white glyph, `viewBox="0 0 24 24"`).
4. **Favicon** — the vendor's own `/favicon.ico` when it serves a real image.
5. **Resolver** — `https://a.favicon.im/<domain>`, a server-side favicon
   resolver for sites whose `/favicon.ico` answers with HTML (e.g. Doubao).
6. **Built-in** — the inline SVG/character shipped in `client.js`.

## Adding an override

1. Drop a white-on-transparent SVG named `<site-id>.svg` here, e.g.
   `logos/doubao.svg`.
2. Add its id to `index.json`, e.g. `["doubao"]`.
3. Reload the page (restart Harness if the asset route has not picked up the
   new files yet).

The file is read on every request, so replacing an SVG updates the icon
without touching code.

Site ids:

- `chatgpt`, `claude`, `gemini`, `grok`, `perplexity`, `copilot`,
  `lechat`, `deepseek`, `kimi`, `qwen`, `doubao`, `yuanbao`,
  `wenxin`, `spark`, `zhipu`, `hailuo`

Example `logos/doubao.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <ellipse cx="12" cy="12" rx="7" ry="8.5" fill="#fff"/>
</svg>
```
