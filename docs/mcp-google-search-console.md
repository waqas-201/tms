# Google Search Console Model Context Protocol (MCP) Setup

Google Search Console is **fully connected and authenticated** for `tameeresehat.com` via **`seo`** (`seoskill.dev`), linked directly to `waqasvu892@gmail.com` with `siteFullUser` permissions.

---

## Authentication Status

- **Account**: `waqasvu892@gmail.com`
- **Verified Property**: `sc-domain:tameeresehat.com`
- **Permission**: `siteFullUser`
- **Local Credentials**: Stored securely in `%APPDATA%\seo\Config` (never committed to git)

---

## Configuration Files

The server is configured across all editor and agent clients:

1. [`.mcp.json`](file:///C:/Users/ALICOM4/projects/tms/.mcp.json) (Claude Code / Antigravity / Core MCP)
2. [`.cursor/mcp.json`](file:///C:/Users/ALICOM4/projects/tms/.cursor/mcp.json) (Cursor IDE)
3. [`.vscode/mcp.json`](file:///C:/Users/ALICOM4/projects/tms/.vscode/mcp.json) (VS Code / Copilot)
4. `~/.claude.json` (Claude Code global config)

```json
{
  "mcpServers": {
    "seo": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "seo@latest", "mcp", "serve"],
      "env": {
        "SEO_CONFIG_DIR": "C:\\Users\\ALICOM4\\AppData\\Roaming\\seo\\Config",
        "SEO_MCP_CONFIGURED_BY": "seo"
      }
    }
  }
}
```

---

## Available Tools & CLI Commands

You can query search data directly in conversation with your AI assistant, or via the CLI:

### Example Assistant Queries
- *"Show me our top search queries and impressions for tameeresehat.com over the last 28 days."*
- *"Are there any pages that lost clicks recently or have low CTR?"*
- *"Check the indexing status of https://www.tameeresehat.com/products/majoon-shabab-gold."*

### CLI Commands
- `npx -y seo sites` &mdash; List verified properties.
- `npx -y seo report --site sc-domain:tameeresehat.com` &mdash; Full performance overview.
- `npx -y seo page --url https://www.tameeresehat.com/` &mdash; Index status & search queries for a single page.
- `npx -y seo doctor` &mdash; Verify connection health.
