# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [2026-09-22]

### Fixed

- **Repo renamed `ahk-linter` → `autohotkey-linter`** (GitHub + local), matching the sibling `autohotkey-tools` rename. Fixed a stale GitHub URL left over from the rename in the paper webapp's data.
- **Grammar failed to load at all.** `grammar.lark`'s `if_stmt` rule had a redundant second alternative that duplicated the base production, causing a LALR(1) reduce/reduce collision. Lark couldn't load the grammar, so **every file — v1 or v2 — silently fell back to per-line regex matching, 100% of the time**, with no error surfaced anywhere. Caught while verifying the paper's expanded-corpus results (rule `P001`, "could not parse, falling back to regex", was firing on all 676 corpus files and all 13 v2 fixtures). Fixed by removing the duplicate alternative and switching the parser from `lalr` to `earley`.
- **Grammar's actual AHK v2 syntax coverage was very narrow**, even once it could load: array/object literals, fat-arrow functions, static class methods, compound assignment operators, `switch`/`case`, single-quoted strings, implicit whitespace concatenation, `??`, case-insensitive keywords, and — most consequential — **the string-escape model assumed backslash escaping when AHK actually uses the backtick** (`` `n ``, `` `" ``, `` `` ``), silently breaking on any string containing a Windows path or regex pattern. Extended construct-by-construct against `tests/fixtures/v2_production/*.ahk`, verifying each addition in isolation before embedding it. Result: 10 of 13 v2 production fixtures now genuinely parse to an AST (was 0 of 13). Two patterns (chained assignment, inline byref defaults) were identified but deliberately left unsupported — both caused Earley ambiguity blowup exceeding 30s on a single file when added, so correctness on a rare pattern was not worth a performance cliff across the whole corpus.
- **Paper (`paper/paper.tex`) mischaracterized its own results in three places**, found while independently verifying the expanded-corpus methodology:
  - The academic-status framing implied external peer review and an arXiv acceptance that never happened — replaced with honest `"Draft -- not yet submitted"` status and a real review-history table of the actual self-review rounds.
  - Three rule IDs in the Top-5 patterns table were mismatched to their actual definitions: `P001` was captioned "`#NoEnv` presence" (real meaning: "could not parse, regex fallback" — real `#NoEnv` count is 126/676, not 650); `S005` was captioned "deprecated directive" (actually flags a *missing* `#Requires`/`#SingleInstance`); `W008` was captioned "Gosub/label use" (that's `W007` — `W008` is the legacy `%var%` syntax).
  - The qwen2.5-coder-32b MCP feedback-loop numbers had no backing raw-data file — re-ran the experiment for real via local Ollama to replace them with genuine results.
- Headline corpus numbers (95,651 issues → 95,645; 903 → 902.5 issues/KLOC; P001 fallback rate 100% → 99.1% on the corpus, 100% → 23% on the v2 fixtures) regenerated from a fresh run against the fixed grammar rather than carried over stale.
- Untracked 16 build-artifact files (`__pycache__/*.pyc`, `ahk_lint.egg-info/*`) that were committed despite already being `.gitignore`d.

### Added

- **`lhm.plugin.json`** at repo root for LobeHub MCP marketplace listing, describing all 5 MCP tools (`lint_ahk_script`, `lint_ahk_file`, `fix_ahk_script`, `lint_check`, `list_checks`) with schemas pulled from `mcp_server.py`.
- GitHub topics (autohotkey, linter, static-analysis, autohotkey-v2, ast, sarif, developer-tools, python) and description set via `gh repo edit`.

### Changed

- **README rewritten**: badges, a hero section explaining AST/SARIF in plain language (previously unexplained acronyms), and a working install path — the previously-documented `pip install ahk-lint` 404s on PyPI.
