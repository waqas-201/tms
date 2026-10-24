# Resend Model Context Protocol (MCP) Setup

This project is configured with the official **Resend MCP Server** (`resend-mcp`), allowing AI assistants (Claude Code, Cursor, VS Code Copilot, Windsurf, etc.) to interact directly with your Resend email services.

## Credentials & Configuration

- **API Key**: Loaded from `.env` (`RESEND_API_KEY`)
- **Default Sender**: Loaded from `.env` (`SENDER_EMAIL_ADDRESS="noreply@tameeresehat.com"`)
- **Dashboard URL**: [Resend Emails Dashboard](https://resend.com/emails?startDate=2026-09-25&endDate=2026-10-24&timezone=Asia/Karachi)

---

## Configuration Files

The following configuration files are set up in this project:

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
