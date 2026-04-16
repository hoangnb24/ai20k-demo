---
name: agent-creator
description: Create new persistent Codex agents for this repo when asked to add a specialist agent, define a reusable subagent role, scaffold `.codex/agents/*.toml`, or wire the agent to local skills and MCP servers.
---

# Agent Creator

Use this skill when the user wants a new reusable agent added to this repository, not just a one-off spawned subagent for the current turn.

## Goal

Create repo-local agent definitions under `.codex/agents` that match the patterns already used in this codebase.

## Local conventions

- Agent files live at `.codex/agents/<slug>.toml`.
- Keep filenames lowercase and hyphen-safe. Use a user-facing `name` inside the file.
- Required fields: `name`, `description`, `model`, `model_reasoning_effort`, `sandbox_mode`, and `developer_instructions`.
- Add `nickname_candidates` when the role is collaborative or likely to be spawned often.
- Use `[[skills.config]]` only when the agent has a repeatable workflow that should load a repo-local skill automatically.
- Add `[mcp_servers.*]` blocks only when the role truly depends on an MCP server.

## Recommended defaults

- Use `gpt-5.4-mini` with `medium` reasoning for focused specialists.
- Use `gpt-5.4` when judgment quality matters more than speed, such as reviews or research-heavy roles.
- Use `read-only` for QA, exploration, docs, and review agents.
- Use `workspace-write` only for builder or repair agents that are expected to edit files.
- Keep `developer_instructions` short, imperative, and role-specific.

## Workflow

1. Inspect the closest existing agent in `.codex/agents` and copy its style.
2. Lock the minimum spec from the request: role name, description, sandbox mode, model/reasoning, edit permissions, and whether the agent should auto-load a skill.
3. If a detail is missing, infer it from the nearest existing agent and state that assumption after the work is done.
4. Scaffold the base TOML with the script in `scripts/init_agent.mjs`.
5. Patch the generated file for any repo-specific details such as `nickname_candidates`, MCP blocks, or linked skills.
6. If the new role needs a repeatable workflow and no fitting skill exists yet, create a matching skill in `.codex/skills/<skill-name>` in the same turn.
7. Read the finished file back and sanity-check that it matches the repo's existing agent style.

## Scaffold command

```bash
node .codex/skills/agent-creator/scripts/init_agent.mjs \
  --slug qa-helper \
  --name "QA Helper" \
  --description "Browser-first QA assistant for lightweight smoke tests." \
  --model gpt-5.4-mini \
  --reasoning medium \
  --sandbox read-only \
  --nicknames "QA,Helper" \
  --instructions "Act as a lightweight QA helper.\nCheck key routes, capture evidence, and avoid code edits unless asked."
```

## Script behavior

- By default the script writes `.codex/agents/<slug>.toml`.
- Pass `--skill-path .codex/skills/<skill-name>` to add an enabled `[[skills.config]]` block.
- Pass `--dry-run` to print the TOML without writing files.
- If the target file already exists, the script stops unless `--force` is passed.

## Deliverable

Return the new agent file path, the main behavior choices you encoded, and any assumptions you made while filling in missing details.
