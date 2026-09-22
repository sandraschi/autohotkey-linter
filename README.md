# autohotkey-linter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](pyproject.toml)
[![AutoHotkey v2](https://img.shields.io/badge/AutoHotkey-v2-orange.svg)](https://www.autohotkey.com/)

**A linter that finds AutoHotkey v1 syntax hiding in your "v2" scripts, and fixes most of it automatically.**

## What is this, and why would I use it?

AutoHotkey's 2022 v2 release was a clean break from v1 — different function-call syntax, different assignment operators, different everything for dozens of commands. Millions of existing scripts (and years of Stack Overflow answers, tutorials, and AI-generated snippets) still use v1 syntax. Mix the two and you get a script that *looks* fine, runs, and then silently misbehaves or crashes on some code path you didn't test — v1 command syntax doesn't always throw a clean error in v2, it just does the wrong thing.

`autohotkey-linter` (package name `ahk-lint`) scans your `.ahk` files, flags every v1 pattern it recognizes — **167 rules**, extracted from a community-maintained v1→v2 converter, not hand-written from memory — and auto-fixes the mechanical ones. Point it at a folder before you ship, run it in CI as a GitHub Actions check, or point an AI coding assistant at it via MCP so it can self-correct its own AutoHotkey output before handing it back to you (this is the linter's most distinctive use case — see [Model Context Protocol](#mcp-server-for-ai-assistants) below).

**Two terms in the feature list that aren't self-explanatory:**
- **AST-based analysis** — instead of just regex-matching text, the linter parses your script into an Abstract Syntax Tree (a structured representation of the code's actual grammar) so it understands context — e.g. it won't flag a v1-looking pattern inside a string literal or comment the way a naive text search would. (Falls back to regex-only checks on files with unusual syntax the grammar can't yet parse — see [Known limitations](#known-limitations).)
- **SARIF output** — Static Analysis Results Interchange Format, a standard JSON schema for lint findings. GitHub (and other platforms) natively render SARIF as inline PR annotations under Security → Code scanning, so `ahk-lint --format sarif` plugs straight into a GitHub Actions workflow with zero custom parsing.

## Quick Start

```bash
# Not yet on PyPI -- install from source:
git clone https://github.com/sandraschi/autohotkey-linter
cd autohotkey-linter
pip install -e .

ahk-lint script.ahk
ahk-lint .\scripts\ --fix          # Auto-fix with .bak backup
ahk-lint . --format sarif > out.sarif  # GitHub code scanning
```

Or run it without installing, via [uv](https://docs.astral.sh/uv/):
```bash
uvx --from git+https://github.com/sandraschi/autohotkey-linter ahk-lint script.ahk
```

## Checks

| ID | Check | Severity | Auto-fix |
|----|-------|----------|----------|
| W001 | `Random, var` → `var := Random()` | error | ✅ |
| W002 | `StringSplit` → `StrSplit()` | error | ✅ |
| W003 | `Gui, Add` → `gui.Add()` | error | ✅ |
| W004 | `IfEqual` → `if ( = )` | error | ✅ |
| W005 | `FileRead, var` → `var := FileRead()` | error | ✅ |
| W006 | `FormatTime, var` → `var := FormatTime()` | error | ✅ |
| W007 | `Gosub` → function call | warning | ❌ |
| W008 | `%var%` → `var` | error | ✅ |
| W009 | `Menu, Tray` → `A_TrayMenu` | error | ✅ |
| W010 | `SetTimer, Label` → `SetTimer(Func)` | warning | ✅ |
| S003 | I/O without try/catch | error | ❌ |
| S005 | Missing `#Requires`/`#SingleInstance` | warning | ❌ |
| S010 | Tab characters | suggestion | ❌ |
| S011 | Trailing whitespace | suggestion | ❌ |
| S012 | Line too long | suggestion | ❌ |
| S020 | Unused variable | warning | ❌ |
| S021 | Unreachable code | warning | ❌ |

These 17 named checks are on top of the core **167-pattern v1→v2 command table** (`rules/v1_to_v2.json`) that does the bulk of the detection work — the W/S codes above catch structural issues the table-driven pass doesn't.

## Configuration

```toml
# .ahklintrc
[checks]
v1_syntax = "error"
style = "warning"

[suppressions]
"tests/" = ["style"]
"legacy/" = "all"

[fix]
enabled = true
backup = true
```

## Per-line Suppression

```autohotkey
; @ahk-lint-disable-next-line W001
Random, var, 1, 10  ; intentional v1 compat
```

## Output Formats

```bash
ahk-lint src/                        # Terminal (default)
ahk-lint src/ --format json           # JSON
ahk-lint src/ --format sarif          # GitHub code scanning
```

## MCP Server for AI Assistants

`mcp_server.py` exposes this linter as an [MCP](https://modelcontextprotocol.io/) tool, so an AI coding assistant (Claude, Cursor, etc.) can lint its own AutoHotkey output and self-correct before showing it to you, instead of you catching v1-syntax mistakes by hand. A real evaluation of this exact loop — two local LLMs, 10 prompts each, generate → lint → feed errors back → regenerate — is in [`paper/`](paper/).

## Known limitations

- **Coverage is ~51%** of the ~325 patterns in the reference converter this tool's rule table was extracted from — the gap is mostly niche commands and complex procedural transformations (GUI restructuring, `DllCall` rewriting) that need context-aware logic, not pattern matching. See `tests/coverage_analysis.py` for the methodology and its own caveats.
- **The AST parser doesn't yet handle 100% of real-world AHK v2 grammar** — on a file it can't fully parse, it falls back to regex-only checks (still catches the common W/S codes, just without the context-awareness AST gives you).
- **Not yet published to PyPI** — install from source or via `uvx --from git+...` (see Quick Start).

## Also in this repo

- [`paper/`](paper/) — an in-progress paper on this tool's methodology and evaluation, going through iterative self-review before any real submission. Not yet posted to arXiv or anywhere else.
- [`mcp_server.py`](mcp_server.py) — the MCP tool server described above.
- [`web_sota/`](web_sota/) — a small dashboard (Dashboard / Paper / Lab pages) for browsing checks and the paper status interactively.

## License

MIT
