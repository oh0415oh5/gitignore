# Hanok Kitchen — MCP Restaurant App

Interactive MCP App that lets a host browse a Korean restaurant menu, build a cart, and place an order through a bundled React UI.

## Tools

| Tool | Description |
|------|-------------|
| `browse-menu` | Returns menu items. Optional `category`: `appetizer`, `main`, `dessert`, `drink`. |
| `place-order` | Accepts `{ items: [{ id, quantity }] }` and returns an order summary with tax. |

Both tools link to the same UI resource: `ui://restaurant/mcp-app.html`.

## Quick start

```bash
cd mcp-restaurant-app
npm install
npm run dev
```

The HTTP server listens on `http://localhost:3001/mcp`.

For Claude Desktop or other stdio hosts:

```bash
npm run build
npm run serve:stdio
```

## Test with basic-host

```bash
# Terminal 1
npm run build && npm run serve

# Terminal 2 (from cloned ext-apps repo)
cd /tmp/mcp-ext-apps/examples/basic-host
npm install
SERVERS='["http://localhost:3001/mcp"]' npm run start
```

Open `http://localhost:8080` and invoke `browse-menu`.

## Integrating into an existing MCP server

Copy these pieces into your server:

1. `menu.ts` — menu data and order helpers
2. `server.ts` — `registerAppTool` / `registerAppResource` registrations
3. `src/` + `mcp-app.html` — React UI bundle
4. Build the UI into `dist/mcp-app.html` before serving resources

Point your existing server's resource reader at the built `dist/mcp-app.html` file and register the same tool names, or rename them consistently across server and UI `callServerTool` calls.

## Architecture

```
browse-menu / place-order (tools)
        │
        ▼
_meta.ui.resourceUri → ui://restaurant/mcp-app.html
        │
        ▼
registerAppResource serves bundled HTML from dist/
        │
        ▼
React UI (useApp) renders menu, cart, and checkout
```
