---
title: 'Your Agent Framework Has 20-Year-Old Bugs Underneath It'
description: 'Check Point found 11 flaws across six AI agent frameworks. The mechanism, the CVE list with fixed versions, and the controls that block the chain.'
pubDate: 2026-08-28
track: technical
question: 'Is my agent framework exposed to the prompt-injection-to-RCE bugs, and which configs actually block the chain?'
keywords:
  - AI agent framework vulnerabilities
  - LangChain security
  - LangGraph RCE
  - prompt injection remote code execution
  - securing AI agents production
  - AI agent security best practices
heroImage: '../../assets/art/agent-framework-20-year-old-bugs-light.webp'
heroImageDark: '../../assets/art/agent-framework-20-year-old-bugs-dark.webp'
heroAlt: 'A regular six-column grid of forty-two small circles with a fine horizontal line through the centre row; one circle on that row is an open ring, and a thin line runs down from its gap and out past the bottom of the grid.'
readingTime: '9 min read'
notionId: '3c9ced67-050a-811c-816f-c984c9e7b633'
---
<div class="tldr">

## Executive TL;DR

- Check Point Research spent a year probing LangChain, LangGraph, CrewAI, AutoGen, Microsoft Agent Framework, and Google ADK, and disclosed 11 vulnerabilities. Most were old server bug classes: insecure deserialization, server-side request forgery, path traversal, use-after-free.
- The dangerous property is not the injection. In several of these frameworks, attacker-controlled text can cross out of the model's context and into trusted framework code, reaching orchestration state directly.
- Worked example: Semantic Kernel's in-memory vector store (CVE-2026-26030) passed model-controlled filter strings to `eval()`. A crafted prompt escapes the template string, walks the Python class hierarchy to `os`, and runs shell commands. Fixed in `semantic-kernel` 1.39.4.
- LangGraph's checkpointer drew three CVEs (CVE-2025-67644, CVE-2026-28277, CVE-2026-27022; CVSS 7.3 / 6.8 / 6.5) on top of an earlier deserialization RCE (CVE-2025-64439, CVSS 7.4). LangChain Core's `dumps()` / `dumpd()` drew CVE-2025-68664 at CVSS 9.3.
- Every one of these has a fixed release. The highest-value hour you can spend is a patch pass: bump and pin `langchain-core`, `langgraph`, `langgraph-checkpoint-*`, and `semantic-kernel` past the fixes listed below.
- After patching, what shrinks blast radius is scoped credentials, a sandbox around any `eval` or deserialization of tool and checkpoint data, and egress filtering. Not a framework switch: the same bugs turned up in all six.

</div>

## The bug isn't the injection. It's what the framework does next.

Every team shipping an agent has made peace with prompt injection: a retrieved document can carry instructions, so you keep the model on a short leash and check its tool calls. That defence assumes the worst case is the model being fooled. Check Point Research spent a year proving the worse case is the framework being compromised.

Reporting the work, The Register summed the finding up: the flaws "reveal a security failure that extends beyond prompt injection—or any single model." The researchers' own phrasing is the line to keep. "In many agentic frameworks," they wrote, "prompt-controlled content can cross the boundary into trusted framework logic itself." Not trick the model into calling a tool. Reach the code that schedules tools, stores state, and loads checkpoints.

Shahar Tal's summary of what they found: "Almost none of it was a completely new bug class. That's insecure deserialization, server-side request forgeries, path traversals, use-after-free." Those defects are two decades old, and they sit underneath software that reads your inbox and writes to your database. In Check Point's words, "the agent needs no dangerous tools to be turned against you: reading the wrong document is enough."

## How a prompt becomes a shell

The clearest worked example is Microsoft's own. In May 2026 its security team published a walkthrough of two Semantic Kernel flaws.

CVE-2026-26030 lived in Semantic Kernel's in-memory vector store. You could filter results with an expression, and the filter path ran `eval()` on a string that could carry model-controlled input. A blocklist stood in for a sandbox, and it could be bypassed.

The chain: a malicious prompt asks the agent to run a normal-looking function, `search_hotels` in Microsoft's example, with a poisoned argument. The argument is shaped to break out of the template string it lands in. Once outside, the payload walks the Python object hierarchy from a harmless built-in up to `os`, and calls the shell. The model was never jailbroken in the usual sense. It handed a string to a framework function, and the function ran it.

The .NET sibling, CVE-2026-25592, is blunter. An internal method was exposed to the model as callable, and its `localFilePath` argument fed straight into `File.WriteAllBytes()`. Per Microsoft, the parameter "was now entirely AI controlled." Drop a payload into the Windows startup folder and wait for the next login.

LangGraph's checkpointer chain is the server-side version of the same move. An attacker sends a crafted filter parameter that "exploits the SQL injection vulnerability to return a fake checkpoint row to the database query results, where the checkpoint column contains attacker-controlled serialized data." The framework then loads that row as trusted state and executes it. The checkpointer, Check Point notes, "sits directly in the execution path of the entire agent workflow." A bug there is on the main road, not in a side street.

## The CVE table

Every row has a fixed release. Versions shown are the first safe ones.

| Framework | CVE | Class | CVSS | Fixed in |
| --- | --- | --- | --- | --- |
| LangChain Core | CVE-2025-68664 | Serialization injection in `dumps()` / `dumpd()` | 9.3 | `langchain-core` 0.3.81 and 1.2.5 |
| LangChain.js | CVE-2025-68665 | Serialization escaping (JS sibling) | 8.6 | per advisory version ranges |
| LangGraph checkpoint | CVE-2025-64439 | `JsonPlusSerializer` RCE via JSON fallback | 7.4 | `langgraph-checkpoint` 3.0.0 |
| LangGraph checkpoint (SQLite) | CVE-2025-67644 | SQLite injection | 7.3 | `langgraph-checkpoint-sqlite` 3.0.1 |
| LangGraph | CVE-2026-28277 | msgpack deserialization RCE | 6.8 | `langgraph` 1.0.10 |
| LangGraph checkpoint (Redis) | CVE-2026-27022 | RediSearch query injection | 6.5 | `langgraph-checkpoint-redis` 1.0.2 |
| Semantic Kernel (Python) | CVE-2026-26030 | `eval()` on model-controlled filter input | not published | `semantic-kernel` 1.39.4 |
| Semantic Kernel (.NET) | CVE-2026-25592 | Arbitrary file write via AI-controlled path | not published | .NET SDK 1.71.0 |
| Microsoft Agent Framework | none issued | Checkpoint deserialization RCE | not published | patched ($10,000 bounty) |
| Google ADK | none issued | Unauthenticated API code execution via agent file write | not published | patched ($3,133.70 bounty) |

Two caveats. The LangGraph CVSS scores come from The Hacker News tracking the GitHub advisories; Check Point's own writeup gave none. And Check Point's six include CrewAI and AutoGen, but the public writeups so far detail the other four. No detail is not the same as no bug.

Microsoft's vulnerability got no CVE because "the framework wasn't a generally available product when Check Point found the flaw." Google's got none either. Yarden Porat's name is on the LangChain Core report from December 2025, the three LangGraph checkpointer CVEs from June 2026, and the wider disclosure in August. One sustained line of work, not scattered luck.

## Why the same four bug classes keep showing up

Agent frameworks grew from chat wrappers into orchestration runtimes fast, and they carried forward habits that are fine in a script and dangerous in a server.

Serialization is the main one. An agent has to persist state between steps: conversation history, tool output, position in the graph. The fast way is to pickle or JSON-with-type-hints the whole object graph and load it back later. That is insecure deserialization by construction, and it is why the LangChain Core flaw and two of the LangGraph ones (CVE-2025-64439, CVE-2026-28277) are the same shape: a payload loaded as if it were trusted. LangGraph's fix for CVE-2025-64439 was to stop deserializing custom objects saved in the vulnerable mode at all.

`eval()` is the second. Filter expressions, templated prompts, and dynamic tool arguments are all tempting places to evaluate a string directly. Semantic Kernel's vector store did exactly that.

The third is trust-boundary confusion. Frameworks separate "the model produced this" from "the system decided this" in the type system, not in the security model. When a tool argument or a checkpoint row can be shaped by model output and the framework treats it as configuration, the boundary is already gone.

None of this is one vendor's mistake. Six frameworks, the same four errors: that is the story.

## What actually blocks the chain

Ordered by risk reduced per hour spent.

**1. Patch, and pin so it stays patched.** Most of the win is here. Move `langchain-core` past 1.2.5 (or 0.3.81 on the 0.3 line), `langgraph` past 1.0.10, `langgraph-checkpoint` past 3.0.0 with `-sqlite` 3.0.1 and `-redis` 1.0.2, and `semantic-kernel` past 1.39.4 or the .NET SDK past 1.71.0. Microsoft's note on its own fix generalises: "You don't need to rewrite your agent's architecture." Pin exact versions in the lockfile and put a dependency scanner in CI so the next advisory is a red build, not a postmortem.

**2. Scope every credential the agent process holds.** A checkpointer RCE is a crisis because the same process holds your model keys, your database password, and a repo token with write access. Give the agent its own service account, read-only where possible, scoped per resource rather than per account. OWASP's cheat sheet calls for "per-tool permission scoping (read-only vs. write, specific resources)"; enforce it at the IAM layer, not just in framework config.

**3. Sandbox the dangerous operations.** Any `eval`, any deserialization of tool output or checkpoint data, any code-execution tool: run it in a container with no network, a read-only filesystem, and dropped capabilities. Had the Semantic Kernel payload landed somewhere with no `os` and no socket, the chain stops.

**4. Filter egress.** SSRF and data exfiltration both need outbound connections. An allowlist of destinations on the agent's network path turns "attacker got code execution" into "attacker got code execution and can't reach anything."

**5. Log framework internals, not only tool calls.** OWASP again: "Log all agent decisions, tool calls, and outcomes." Extend it to checkpoint reads and writes, deserialization events, and filter evaluations. That is where this class of attack is visible, and tool-call-level tracing misses it entirely.

**6. Treat retrieved content as hostile where it enters context.** "Treat all external data as untrusted (user messages, retrieved documents, API responses, emails)." This does not stop the RCE chains above; it keeps the ordinary injection cases from ever reaching them.

## Managed platforms move some of this, not all

If you run on Amazon Bedrock AgentCore, generally available since October 2025, or a comparable hosted runtime, the deserialization and checkpointer flaws become the provider's to patch, and the sandbox and egress controls are theirs to run and yours to configure. That is a genuine cut in what your team has to get right.

It is not the whole problem. Your tool code still executes somewhere. Your credentials are still scoped by you. A prompt-to-tool-argument path in your own code is still yours to find. A managed runtime changes who patches the framework. It does not change whether your agent holds a write-scoped database token it never needed.

## FAQ

**Is LangChain safe for production?** With `langchain-core` past 1.2.5 and `langgraph` and `langgraph-checkpoint` past the fixes above, the disclosed chains are closed. `langchain-core` alone draws more than 170 million PyPI downloads a month and `langgraph` more than 70 million, so "stop using it" is not a plan most teams can run. Patching is.

**Should I switch frameworks?** Not for this. Check Point found the same bug classes in all six it tested, Microsoft's and Google's included. A switch buys a fresh backlog of the same mistakes.

**How do I test my own agent?** Trace every path where model output reaches a framework API: tool arguments, filter expressions, checkpoint keys, memory writes. For each, ask whether that value is ever `eval`'d, used to build a query, or deserialized. Then feed the agent a document whose text tries to reach those paths, and watch the logs, not the model's reply, for what the framework did with it.

## What to do this week versus this quarter

This week: run a dependency audit, move the four package families past their fixes, pin them, add the scanner to CI. Check what credentials the agent process actually holds and revoke the ones its current job does not need.

This quarter: put a real sandbox around `eval` and deserialization, move credential scoping to IAM, add egress filtering, extend tracing to checkpoint and deserialization events. Then write the test above and run it before every release.

The bugs are old and the fixes are already shipped. The gap is the patch pass nobody put on the calendar.

## Sources

- [Prompt injection isn't the bug, AI agent frameworks are — The Register, 5 August 2026](https://www.theregister.com/security/2026/08/05/prompt-injection-isnt-the-bug-ai-agent-frameworks-are/5283585)
- [When Your AI Agent's Memory Becomes a Security Liability — Check Point Blog](https://blog.checkpoint.com/research/when-your-ai-agents-memory-becomes-a-security-liability/)
- [LangGraph Flaw Chain Exposes Self-Hosted AI Agent Servers to RCE — The Hacker News, June 2026](https://thehackernews.com/2026/06/langgraph-flaw-chain-exposes-self.html)
- [Critical LangChain Core Vulnerability Exposes Secrets via Serialization Injection — The Hacker News, December 2025](https://thehackernews.com/2025/12/critical-langchain-core-vulnerability.html)
- [CVE-2025-64439 — GitHub Advisory GHSA-wwqv-p2pp-99h5](https://github.com/advisories/GHSA-wwqv-p2pp-99h5)
- [CVE-2025-68664: Critical LangChain Flaw Enables Secret Extraction — SOCRadar](https://socradar.io/blog/cve-2025-68664-langchain-flaw-secret-extraction/)
- [Prompts become shells: RCE vulnerabilities in AI agent frameworks — Microsoft Security Blog, 7 May 2026](https://www.microsoft.com/en-us/security/blog/2026/05/07/prompts-become-shells-rce-vulnerabilities-ai-agent-frameworks/)
- [AI Agent Security Cheat Sheet — OWASP](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)
- [langchain-core download statistics — PyPI Stats](https://pypistats.org/packages/langchain-core)
- [langgraph download statistics — PyPI Stats](https://pypistats.org/packages/langgraph)
- [Amazon Bedrock AgentCore is now generally available — AWS, October 2025](https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-bedrock-agentcore-available)

<!--
Artwork brief — from the writer routine. Draw per docs/ARTWORK.md,
then delete this comment.

- **Argument in one sentence:** Well-understood, two-decade-old software bugs sit unpatched in the load-bearing framework layer that every AI agent runs on, so a line of text in a document can reach code that was never meant to hear from it.
- **Geometry:** A regular grid of small open circles, six columns wide, standing for the framework layer. One horizontal hairline rule runs straight through the centre row. On that row a single circle is drawn as an unclosed ring, and one fine line escapes from it downward, crossing cleanly past the bottom edge of the grid.
- **Accent:** mizu, for systems and process — the subject is the framework runtime as infrastructure, the plumbing under a whole category of apps, not a human dispute or a measurement.
- **The deliberate imperfection:** the one unclosed ring on the centre row and the single hairline leaking out of the grid, while everything else stays closed and aligned. That break is the trust boundary failing — prompt-controlled content crossing into framework code.
-->
