# Copilot instructions — levelUp

Quick facts
- Purpose: "levelUp" is a minimalist gym tracker (log reps, weights, rest). See README.md for the short project description.
- Current snapshot: repository contains README.md, LICENSE and a set of GitHub agent configs under .github/agents. No source code, build, test, or lint manifests were detected.

1) Build / test / lint
- None detected in the repository (no package.json, pyproject.toml, Makefile, go.mod, etc.).
- If/when language/tooling is added, update this file with exact commands. (When present, include how to run a single test, e.g. the test runner's invocation for an individual test.)

2) High-level architecture (current)
- No runtime/source tree found. The repository currently stores policy/agent files that define an agent-driven workflow.
- Agent-driven workflow (from .github/agents):
  - Planner: research + produce an ordered implementation plan (WHAT, file assignments, edge cases). Always consult Planner before implementing non-trivial changes.
  - Orchestrator: breaks the plan into phases and delegates to specialist agents, parallelizing tasks that touch disjoint files.
  - Coder (and language-specific coder agents): implement code according to repo patterns and the Planner's file assignments.

3) Key conventions & repo-specific rules (pulled from .github/agents)
- Planner-first: Produce and follow a Planner-created plan before implementing complex changes.
- Explicit file scoping: When delegating tasks (or making automated edits), list exact files to create/modify to avoid conflicts.
- Don’t tell agents HOW to implement: describe the outcome (WHAT) and constraints, not specific implementation steps.
- Parallelization rules: run tasks in parallel only if they touch different files and have no data dependencies; otherwise run sequentially.
- Mandatory coding principles (from Coder agent):
  - Prefer flat, explicit structure over deep abstraction.
  - Group code by feature; keep shared utilities minimal.
  - Small-to-medium functions, linear control flow, explicit state passing; avoid globals.
  - Favor full-file rewrites when making large changes (regenerability).
  - Produce deterministic, testable behavior; structured logs and explicit errors.

4) Files to consult before large changes
- .github/agents/coder.agent.md
- .github/agents/planner.agent.md
- .github/agents/orchestrator.agent.md
(These contain mandatory process requirements such as: ALWAYS use #context7 MCP Server for docs lookups, Planner-first, and file assignment rules.)

5) AI-assistant / integration notes
- No CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, or other external assistant configs were found.
- The repo already includes agent role docs under .github/agents — Copilot sessions should read those files and follow their rules.

6) When you add code or CI
- Add concrete build/test/lint commands here (and show how to run a single test). Example locations to document: package.json scripts, Makefile targets, tox.ini/pyproject, go.mod commands, GitHub Actions workflows.

MCP Servers
- The agent docs in .github/agents require usage of the #context7 MCP Server for reading documentation. Consider adding/configuring #context7 (or another doc/context MCP) if you want Copilot/agents to pull external documentation.

If anything here should be expanded (language-specific commands, example test invocations, or more architecture notes), say which area and it will be added.
