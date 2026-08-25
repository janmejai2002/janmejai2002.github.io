---
title: 'The Agentic Shift: Why LLMs are Moving from Chat to Autonomous Actions'
description: 'LLMs are shifting from answering questions to taking actions. The adoption numbers, the OpenAI/Anthropic/Google SDK race, and the security bill now coming due.'
pubDate: 2026-08-25
keywords:
  - Autonomous Agents
  - AI Security
  - LLM Workflows
readingTime: '7 min read'
notionId: '3c7ced67-050a-810c-a43c-cc91eb2d9fc8'
heroImage: '../../assets/art/agentic-shift-llms-chat-to-autonomous-actions-light.webp'
heroImageDark: '../../assets/art/agentic-shift-llms-chat-to-autonomous-actions-dark.webp'
heroAlt: 'On the left, a small ring with two arrowheads returning to itself. On the right, a row of open circles joined in a chain runs left to right and crosses a vertical dashed line. The last two circles are solid red, the final link stops in mid-air, and its circle sits below the line of the others.'
---

<div class="tldr">

## Executive TL;DR

- In March 2026 a poisoned update to LiteLLM — the routing layer underneath CrewAI, DSPy and Microsoft's GraphRAG — sat on PyPI for about 40 minutes. It reached more than 2,500 organisations and exposed over 430,000 CI/CD pipelines.
- No model was jailbroken. The software wiring agents to real infrastructure was the target, which is what changes once an LLM stops answering and starts acting.
- 80% of enterprise applications shipped or updated in Q1 2026 embed at least one agent, up from 33% in 2024. Only 14.4% of those agents go live with full security or IT sign-off.
- Google logged a 32% rise in prompt-injection payloads planted in web content between November 2025 and February 2026. For agents acting without a human on consequential calls, prompt injection is still unsolved.
- Gartner expects more than 40% of agentic projects to be cancelled by the end of 2027 — on cost and missing risk controls, not on capability.

</div>

In March 2026, attackers didn't have to trick anyone. They poisoned a single software update, and it gave them a backdoor into the AI infrastructure of more than 2,500 companies before anyone noticed something was wrong.

The library they hit was [LiteLLM, the routing layer that CrewAI, DSPy, Microsoft's GraphRAG, and dozens of other agent frameworks use to connect an AI system to the tools it needs to actually do something](https://www.trendmicro.com/en_us/research/26/c/inside-litellm-supply-chain-compromise.html). On March 24, a threat actor who had [stolen LiteLLM's own PyPI publishing token straight out of its build pipeline, by first hijacking an unpinned security scanner that ran there](https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/), pushed two malicious versions to PyPI. Buried inside was a file that ran automatically on every Python startup: harvest credentials, move laterally across Kubernetes clusters, install a backdoor that phones home for more instructions. [It was live for about 40 minutes before PyPI caught it. That was enough to expose more than 430,000 CI/CD pipelines](https://www.securityweek.com/over-2500-organizations-impacted-by-litellm-supply-chain-attack/).

No chatbot got jailbroken in that incident. The software connecting AI systems to real infrastructure became the target itself, and that's the direct cost of the shift this article is actually about: LLMs stopped being something you talk to and became something you give a job.

## What "agentic" actually means

Chat is a single round trip. You ask, the model answers, the conversation waits for you again. An agent breaks that loop open: the model reads a goal, decides on a step, calls a tool (a database query, an API, a file write, another model), reads the result, and decides on the next step, without a human approving each one. The autonomy isn't in the model getting smarter. It's in the leash getting longer.

That distinction is why the LiteLLM incident matters here specifically. A chatbot with a security hole leaks a conversation. An agent framework with a security hole hands an attacker the same tool access the agent had, which by design usually includes credentials, internal APIs, and write permissions. The more autonomous the workflow, the more valuable the thing sitting behind it becomes to compromise.

In production, that loop rarely stays a single agent talking to a single tool. A support ticket might get triaged by one agent, handed to a second that queries the billing system, and closed out by a third that drafts the customer reply, each step passing state to the next without a human reading the handoff. That's what "LLM workflow" means once it stops being a diagram and becomes something running against real data: several models and several tools, chained together, each trusting what the last one handed it.

## How far the shift has actually gone

The numbers say this isn't a lab curiosity anymore. [80% of enterprise applications shipped or updated in the first quarter of 2026 embedded at least one AI agent, up from 33% in 2024](https://www.digitalapplied.com/blog/ai-agent-adoption-2026-enterprise-data-points) — a figure attributed to Gartner, and a steeper curve than any enterprise software category since cloud.

The jobs themselves are mundane on purpose. The agents furthest along aren't writing strategy memos, they're qualifying inbound leads and drafting the follow-up email, reconciling an invoice against a purchase order, or triaging a support ticket and pulling the right internal doc before a human ever sees it.

But the more telling gap is between trying agents and trusting them. [Eighty-eight percent of enterprises now report regular use of AI](https://www.accelirate.com/agentic-ai-statistics-2026/), and embedding an agent in a shipped application is evidently a decision most of them have already made. Handing one the keys is a separate decision, and it is the one still being deliberated: the more consequential the task, the longer organizations insist on watching before they let go.

## The tussle at the top, and the mess underneath it

The three labs racing to own how agents get built each picked a different bet, and Google moved first. [It shipped the Agent Development Kit at Cloud Next in April 2025](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/), built for hierarchical multi-agent systems and [now spanning four languages](https://composio.dev/content/claude-agents-sdk-vs-openai-agents-sdk-vs-google-adk), betting that large organizations want structure more than flexibility. [Anthropic followed on September 29, 2025, shipping the Claude Agent SDK alongside Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5), betting on developer control and auditable reasoning, constitutional constraints built into the model itself rather than bolted on around it. [OpenAI answered a week later with AgentKit on October 6](https://openai.com/index/introducing-agentkit/), betting on managed infrastructure and speed to production.

None of those three companies, though, control the layer where the LiteLLM attack actually landed. Underneath the labs' SDKs sits a sprawling, mostly open-source ecosystem, LangGraph, CrewAI, and a long tail of smaller frameworks, that wires the labs' models to the outside world. That layer already carries real enterprise weight: [LangGraph alone crosses 40 million monthly PyPI downloads and runs production agents at Uber, LinkedIn, Klarna, and Replit](https://redwerk.com/blog/langgraph-vs-crewai/), while CrewAI processes more than 450 million agent workflows a month. This is not a hobbyist layer anyone can afford to ignore.

That's where the actual "tussle" is happening: not between the giants, who are mostly competing on developer experience, but between the giants' managed platforms and the open layer that most of the industry actually builds on because it's free, flexible, and nobody's permission is required to use it. The trade is real. The open layer moves faster and locks you into nothing. It also means the software holding your agent's credentials might be maintained by a small team whose CI pipeline pulls a security scanner from an unpinned apt package, which is exactly how the March attack got in.

## The governance gap nobody's closed yet

[Only 14.4% of agents reach production with full security or IT approval behind them](https://www.miniorange.com/blog/ai-agent-security-risks/) — the rest ship on somebody's judgement call. [Google's own researchers tracking the open web logged a 32% jump in malicious prompt injection payloads planted in web content between November 2025 and February 2026](https://atlan.com/know/prompt-injection-attacks-ai-agents/), content designed specifically to hijack an agent that happens to read it while doing its job. The mechanism is almost insultingly simple: a document the agent is asked to summarize can contain a hidden line of text instructing it to forward internal data somewhere else, and the agent, which has no reliable way to tell its user's instructions apart from ones buried in the content it's reading, can follow that instruction while behaving normally in every other respect.

Prompt injection remains, as of this year, unsolved for agents operating without a human checking consequential decisions, which is why intelligence agencies in the Five Eyes alliance are telling organizations to deploy incrementally and keep a person in the loop wherever a mistake would actually cost something. Prompt injection isn't the only risk on that list, either: [security teams tracking agent deployments also flag over-privileged access (an agent given broader tool permissions than the task requires), weak credential handling, unsafe tool integrations, and poor visibility into what an agent actually did after the fact](https://www.miniorange.com/blog/ai-agent-security-risks/). All four showed up at once in the LiteLLM incident: the backdoor harvested credentials, escalated through whatever tool access it found, and moved through hundreds of thousands of pipelines before most of the affected organizations even knew to look.

[Gartner is blunter about where this leads: more than 40% of agentic AI projects will be cancelled by the end of 2027](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027), not because the technology failed, but because of escalating costs, unclear business value, and risk controls that were never built to match the autonomy that got shipped. "Most agentic AI projects right now are early stage experiments or proof of concepts that are mostly driven by hype and are often misapplied," said Anushree Verma, a senior director analyst at Gartner, in the firm's own release.

That's the actual shape of the agentic shift. Capability moved first. Access followed close behind it. Oversight is still catching up, and until it does, every company handing an LLM a job is running the same bet the industry made with LiteLLM: that nothing downstream gets compromised before anyone's watching. In March 2026, for 2,500 companies, that bet took 40 minutes to lose.

## Sources

- [Your AI Gateway Was a Backdoor: Inside the LiteLLM Supply Chain Compromise — Trend Micro](https://www.trendmicro.com/en_us/research/26/c/inside-litellm-supply-chain-compromise.html)
- [How a Poisoned Security Scanner Became the Key to Backdooring LiteLLM — Snyk](https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/)
- [Over 2,500 Organizations Impacted by LiteLLM Supply Chain Attack — SecurityWeek](https://www.securityweek.com/over-2500-organizations-impacted-by-litellm-supply-chain-attack/)
- [AI Agent Adoption 2026: 120+ Enterprise Data Points — Digital Applied](https://www.digitalapplied.com/blog/ai-agent-adoption-2026-enterprise-data-points)
- [Agentic AI Statistics 2026: Global Enterprise Adoption and Market Insights — Accelirate](https://www.accelirate.com/agentic-ai-statistics-2026/)
- [Claude Agents SDK vs. OpenAI Agents SDK vs. Google ADK: The better framework for building AI agents in 2026 — Composio](https://composio.dev/content/claude-agents-sdk-vs-openai-agents-sdk-vs-google-adk)
- [Agent Development Kit: Making it easy to build multi-agent applications — Google Developers Blog](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/)
- [Introducing Claude Sonnet 4.5 — Anthropic](https://www.anthropic.com/news/claude-sonnet-4-5)
- [Introducing AgentKit — OpenAI](https://openai.com/index/introducing-agentkit/)
- [AI Agent Security Risks: What Enterprises Need to Know in 2026 — miniOrange](https://www.miniorange.com/blog/ai-agent-security-risks/)
- [How Prompt Injection Attacks Compromise AI Agents in 2026 — Atlan](https://atlan.com/know/prompt-injection-attacks-ai-agents/)
- [Gartner Predicts Over 40% of Agentic AI Projects Will Be Canceled by End of 2027 — Gartner](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)
- [LangGraph vs. CrewAI in 2026: Which One Survives the Production — Redwerk](https://redwerk.com/blog/langgraph-vs-crewai/)
