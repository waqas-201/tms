# Resend Model Context Protocol (MCP) Setup

This project is configured with the official **Resend MCP Server** (`resend-mcp`), allowing AI assistants (Claude Code, Cursor, VS Code Copilot, Windsurf, etc.) to interact directly with your Resend email services.

## Credentials & Configuration

- **API Key**: `RESEND_API_KEY`. Keep the real value in `.env` / `.env.local`, or inline it
  in your local MCP config — those files are gitignored (see below).
- **Default Sender**: `SENDER_EMAIL_ADDRESS="noreply@tameeresehat.com"`
  (must be on the verified `tameeresehat.com` domain — never `onboarding@resend.dev`,
  which can only deliver to the Resend account owner)
- **Dashboard URL**: [Resend Emails Dashboard](https://resend.com/emails?startDate=2026-09-25&endDate=2026-10-24&timezone=Asia/Karachi)

### These config files are gitignored — never commit them

`.mcp.json`, `**/.mcp.json`, `.cursor/`, `.vscode/` and `.claude/settings.local.json`
are listed in `.gitignore` because they can hold live API keys. Verify with:

```bash
git check-ignore -v .mcp.json .cursor/mcp.json .vscode/mcp.json
```

A `git add -A` will not stage them; `git add` refuses them even when named explicitly.
The gitleaks pre-commit hook (`.gitleaks.toml`) blocks any key that slips through.

### Rotating the Resend API key

1. Create the new key at <https://resend.com/api-keys>, then delete the old one.
2. Update it in every place that holds it (all local + gitignored):
   - `.env`, `.env.local` (`RESEND_API_KEY`)
   - `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json` (if you inline it there)
3. Update the Vercel project env var, then redeploy:
   ```bash
   vercel env add RESEND_API_KEY production --force --sensitive
   vercel env add RESEND_API_KEY preview  --force --sensitive
   git push origin main        # triggers a production deployment
   ```
4. Smoke test: sign up with a non-owner address and confirm the verification mail
   arrives. See `docs/email-auth-troubleshooting.md`.

---

## Configuration Files

The following local configuration files are set up in this project (all gitignored):

1. **Claude Code / MCP Core (`.mcp.json`)**:
   ```json
   {
     "mcpServers": {
       "resend": {
         "command": "npx",
         "args": ["-y", "resend-mcp"],
         "env": {
           "RESEND_API_KEY": "re_...",
           "SENDER_EMAIL_ADDRESS": "noreply@tameeresehat.com"
         }
       }
     }
   }
   ```
   Omit `RESEND_API_KEY` here if the variable is already exported in your shell —
   `resend-mcp` reads it from the process environment.

2. **Cursor IDE (`.cursor/mcp.json`)**:
   Enables Resend tools inside Cursor Chat and Composer.

3. **VS Code (`.vscode/mcp.json`)**:
   Enables Resend tools inside GitHub Copilot and MCP-compliant extensions.

---

## Available MCP Capabilities & Tools

The server provides full coverage of the Resend platform:

- **Emails**: Send emails, batch send emails, list sent emails, retrieve email status and delivery metrics.
- **Domains**: List domains, verify domain DNS records, add and manage sending domains.
- **Audiences & Contacts**: Manage contacts, audience lists, contact properties, and imports.
- **Broadcasts & Templates**: Create and trigger marketing/transactional broadcasts and template renders.
- **Webhooks & Events**: Inspect webhook delivery logs, monitor inbound and delivery events.
- **API Keys & Usage**: Check API key scopes, monitor daily/monthly sending usage and quotas.

---

## Alternative: Remote Hosted Endpoint (OAuth / HTTP)

Resend also provides a hosted remote endpoint:
- **URL**: `https://mcp.resend.com/mcp`
- **In Claude Code**:
  ```bash
  claude mcp add --transport http resend https://mcp.resend.com/mcp
  ```
- **In Cursor**:
  ```json
  {
    "mcpServers": {
      "resend": {
        "url": "https://mcp.resend.com/mcp"
      }
    }
  }
  ```
