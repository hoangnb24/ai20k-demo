---
name: qa-browser-verify
description: Browser-first QA skill for local web apps. Use when exploring an application, smoke-testing routes, checking whether a page loads, validating a user flow, reproducing a UI bug, or confirming a fix. Prefer the local `agent-browser` CLI for screenshots, snapshots, console checks, navigation, and basic interactions.
---

# QA Browser Verify

Use this skill for manual QA passes against a running local application.

## Default stance

- Prefer `agent-browser` over curl for UI verification.
- Verify what the user actually sees: rendered content, overlays, console errors, and basic interactions.
- Stay in QA mode: gather evidence first, describe failures clearly, and avoid editing code unless the user asks for a fix.
- Run `agent-browser` commands sequentially for a single session. Do not fire multiple commands at the same session in parallel.

## Setup

1. Identify the dev server URL from the repo or running processes.
2. If `agent-browser` is missing, stop and report that blocker.
3. If browser launch fails because Playwright browsers are missing, run:

```bash
agent-browser install
npx playwright install chromium chromium-headless-shell
```

4. Use a dedicated session name, for example:

```bash
AGENT_BROWSER_SESSION=qa agent-browser open http://localhost:3000
```

## Smoke-test flow

Run this loop for the home route and any important feature routes:

```bash
AGENT_BROWSER_SESSION=qa agent-browser open http://localhost:3000
AGENT_BROWSER_SESSION=qa agent-browser screenshot /tmp/qa-home.png
AGENT_BROWSER_SESSION=qa agent-browser snapshot -i
AGENT_BROWSER_SESSION=qa agent-browser eval 'document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay") ? "ERROR_OVERLAY" : "OK"'
AGENT_BROWSER_SESSION=qa agent-browser eval 'document.body.innerText.trim().length > 0 ? "HAS_CONTENT" : "BLANK"'
AGENT_BROWSER_SESSION=qa agent-browser console
AGENT_BROWSER_SESSION=qa agent-browser errors
```

## Interaction checks

- Use `fill`, `type`, `click`, `press`, and `get url` to validate a real user path.
- After submitting a form or triggering a flow, wait briefly and capture a second screenshot.
- When useful, confirm the page content with `get text`, `eval`, or another `snapshot -i`.

Example:

```bash
AGENT_BROWSER_SESSION=qa agent-browser fill 'input[name="prompt"]' 'Hello'
AGENT_BROWSER_SESSION=qa agent-browser click 'button[type="submit"]'
AGENT_BROWSER_SESSION=qa agent-browser wait 3000
AGENT_BROWSER_SESSION=qa agent-browser screenshot /tmp/qa-after-submit.png
```

## Failure capture

When a check fails:

1. Save a screenshot of the broken state.
2. Capture `console` and `errors`.
3. If the request flow matters, inspect `network requests`.
4. Report the exact route, user action, observed result, and expected result.

## Closeout

Finish by closing the browser session:

```bash
AGENT_BROWSER_SESSION=qa agent-browser close
```

Return a concise QA summary:

- what routes were checked
- what interactions were tested
- pass/fail status
- concrete evidence for any failure
