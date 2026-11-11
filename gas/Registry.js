// GENERATED from site/harness/registry.mjs by site/harness/generate.mjs — do not edit.
var REGISTRY = {
  "REPO": "janmejai2002/janmejai2002.github.io",
  "NOTION": {
    "version": "2025-09-03",
    "radar": "511e41a3-c1cd-47e0-8fa2-d319feef0ced",
    "production": "d39ea073-cc87-4c25-8a3c-d9f276a59b68",
    "news": "288c805b-3d3f-46ae-98e4-893ab3e6d562"
  },
  "SHEET": {
    "id": "1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0",
    "tabs": {
      "Radar": {
        "owner": "agent",
        "writer": "radar",
        "columns": [
          "Date",
          "Track",
          "Title",
          "Reader Question",
          "Pitch",
          "Keywords",
          "SeoBrief"
        ]
      },
      "Drafts": {
        "owner": "agent",
        "writer": "writer",
        "keyPrefix": "DR",
        "columns": [
          "Date",
          "Track",
          "Title",
          "DocUrl",
          "Draft",
          "Status",
          "Radar Title"
        ]
      },
      "Case Studies": {
        "owner": "agent",
        "writer": "case-studies",
        "keyPrefix": "CS",
        "columns": [
          "Date",
          "Track",
          "Title",
          "DocUrl",
          "Draft",
          "Status"
        ]
      },
      "Talks": {
        "owner": "agent",
        "writer": "talks",
        "keyPrefix": "TK",
        "columns": [
          "Date",
          "Track",
          "Title",
          "DocUrl",
          "Draft",
          "Status"
        ]
      },
      "News": {
        "owner": "agent",
        "writer": "news",
        "columns": [
          "Date",
          "Category",
          "Headline",
          "Summary",
          "Interview Angle",
          "Source"
        ]
      },
      "Repair Outbox": {
        "owner": "agent",
        "writer": "repairer",
        "columns": [
          "Date",
          "Key",
          "Attempt",
          "Title",
          "Draft",
          "Changed",
          "Not Fixed"
        ]
      },
      "Runs": {
        "owner": "agent",
        "writer": "all",
        "columns": [
          "Date",
          "Time",
          "Task",
          "Result",
          "Note"
        ]
      },
      "Status": {
        "owner": "code",
        "columns": [
          "Key",
          "Title",
          "Track",
          "Draft Status",
          "Failure Codes",
          "Blocked Reason",
          "Repair Attempts",
          "Live URL",
          "Updated"
        ]
      },
      "Repair Queue": {
        "owner": "code",
        "columns": [
          "Key",
          "Title",
          "Track",
          "Next Attempt",
          "Failure Codes",
          "Blocked Reason",
          "Playbook",
          "Previous Notes",
          "Current Draft"
        ]
      }
    }
  },
  "KEY_RULE": {
    "hashInput": "<tab>|<date>|<title trimmed>",
    "hashLength": 6,
    "format": "<prefix>-<YYYYMMDD>-<hash>"
  },
  "REPAIR": {
    "maxAttempts": 4,
    "issueLabel": "needs-human",
    "rejectedPrefix": "Repair rejected (attempts"
  },
  "TASKS": [
    {
      "name": "case-studies",
      "label": "Case Studies",
      "at": "01:00",
      "model": "Flash",
      "expectBy": "03:00"
    },
    {
      "name": "radar",
      "label": "SEO Radar",
      "at": "03:35",
      "model": "Flash",
      "expectBy": "05:00"
    },
    {
      "name": "writer",
      "label": "Article Writer",
      "at": "04:15",
      "model": "Argon",
      "expectBy": "07:00"
    },
    {
      "name": "news",
      "label": "News",
      "at": "06:00",
      "model": "Flash",
      "expectBy": "08:00"
    },
    {
      "name": "repairer",
      "label": "Repairer",
      "at": "09:00, 19:00",
      "model": "Argon",
      "expectBy": null
    },
    {
      "name": "talks",
      "label": "Talks",
      "at": "13:00",
      "model": "Flash",
      "expectBy": "15:00"
    }
  ],
  "FAILURES": {
    "G-TITLE": {
      "class": "block",
      "where": "preflight",
      "scope": "section",
      "summary": "Title over 70 characters",
      "playbook": "Rewrite the title to 70 characters or fewer, keeping the main keyword and the specific claim. Count the characters. Put the new title in the Title column of your Repair Outbox row. Change nothing else."
    },
    "G-META": {
      "class": "block",
      "where": "preflight",
      "scope": "section",
      "summary": "Meta description missing or over 160 characters",
      "playbook": "The first lines of the draft must be the callout \"> **Meta description:** ...\" then \"> **Slug:** ...\". Write a meta description of 160 characters or fewer stating the thesis and one number. Count the characters."
    },
    "G-QUESTION": {
      "class": "block",
      "where": "preflight",
      "scope": "section",
      "summary": "Reader Question over 120 characters",
      "playbook": "Shorten the \"> **Reader Question:**\" line in the opening callout to 120 characters or fewer. It must still be a question a practitioner would actually ask."
    },
    "G-TLDR": {
      "class": "block",
      "where": "preflight",
      "scope": "section",
      "summary": "No Executive TL;DR at the top",
      "playbook": "Directly after the opening callout, add an H2 reading exactly \"## Executive TL;DR\" followed by 4 to 6 bullets carrying the article's actual findings and numbers (taken from the body, nothing new)."
    },
    "G-BLOCK": {
      "class": "block",
      "where": "preflight",
      "scope": "article",
      "summary": "Contains formatting the site cannot convert",
      "playbook": "Rewrite the section named in Blocked Reason using only paragraphs, H2/H3 headings, bullet or numbered lists, quotes, normal markdown tables, and code blocks for real code."
    },
    "G-ASCII": {
      "class": "block",
      "where": "preflight",
      "scope": "section",
      "summary": "Diagram drawn with text characters",
      "playbook": "Find every code block that draws boxes, arrows or flows with characters (+---+, |, v, ->, -->, ┌─┐). Replace each one with a numbered list of steps (\"1. The request reaches the router. 2. ...\") or a markdown table. Keep every fact the diagram carried."
    },
    "G-LATEX": {
      "class": "block",
      "where": "preflight",
      "scope": "section",
      "summary": "Maths written in LaTeX",
      "playbook": "Remove all LaTeX: $...$, $$...$$, \\frac, \\sqrt, \\times, \\approx, \\cdot, \\sum. Write each formula as plain text inside backticks, e.g. `cost = tokens × price`. Single variables in prose become plain words or backticked names (`k`)."
    },
    "G-TABLE": {
      "class": "block",
      "where": "build",
      "scope": "article",
      "summary": "Markdown table broken into paragraphs",
      "playbook": "Tables must be continuous: header row, |---| row, data rows, no blank lines between rows, never inside a code block."
    },
    "G-HTML": {
      "class": "block",
      "where": "build",
      "scope": "article",
      "summary": "Raw HTML broke and leaked into the page as text",
      "playbook": "Remove any raw HTML (<div>, <figure>, <svg>) from the article body. Only the Artwork SVG section may contain SVG, and it must have no blank lines."
    },
    "G-HEADING": {
      "class": "block",
      "where": "build",
      "scope": "article",
      "summary": "Body starts with a \"# Title\" heading",
      "playbook": "Delete any \"# \" (H1) heading in the body. Body headings start at \"## \"."
    },
    "G-IMAGE": {
      "class": "block",
      "where": "build",
      "scope": "article",
      "summary": "Image without alt text in the body",
      "playbook": "Remove every markdown image (![...](...)) and <img> from the article body. The only picture an article has is its Artwork SVG."
    },
    "G-ART": {
      "class": "warn",
      "where": "preflight",
      "scope": "section",
      "summary": "Artwork SVG unusable, fallback art used",
      "playbook": "In \"## Artwork SVG\": an \"Alt:\" line, then one ```xml code block with a 1600x900 <svg> using only {{tokens}}, starting with <rect width=\"1600\" height=\"900\" fill=\"{{paper}}\"/>. No hex colours, no blank lines."
    },
    "G-SOURCES": {
      "class": "warn",
      "where": "preflight",
      "scope": "article",
      "summary": "Fewer than 3 source links",
      "playbook": "Add a \"## Sources\" section before \"## Artwork brief\" with at least 3 bullets \"[Page title](https://url) — what it supports\", each a page that actually contains the claim. For Talks the first is the video URL. Remove any claim you cannot source."
    },
    "G-LENGTH": {
      "class": "warn",
      "where": "preflight",
      "scope": "none",
      "summary": "Article over the word budget",
      "playbook": "Only if the gate's count is over 2,200 words. The gate counts prose only: code blocks, inline code, HTML tags and the Artwork sections are not counted (Sources link text is). Cut the least-supported paragraphs until the count is under 2,200. Never delete a limitations or trade-offs section. This is a warning: it never justifies rewriting the article."
    },
    "G-STYLE": {
      "class": "warn",
      "where": "preflight",
      "scope": "section",
      "summary": "Banned words or em dashes",
      "playbook": "Replace each banned word with a concrete verb and each em dash (—) with a period, comma, colon or parentheses."
    },
    "G-BUILD": {
      "class": "block",
      "where": "build",
      "scope": "article",
      "summary": "Site build failed for a reason not tied to one article",
      "playbook": "Not repairable by the Repairer. The owner (or Claude) must read the GitHub Actions log.",
      "noRepair": true
    }
  },
  "TRACKS": [
    {
      "notion": "Technical",
      "id": "technical",
      "accent": "mizu",
      "auto": true,
      "tab": "Drafts",
      "task": "writer"
    },
    {
      "notion": "Business",
      "id": "business",
      "accent": "ochre",
      "auto": true,
      "tab": "Drafts",
      "task": "writer"
    },
    {
      "notion": "Basics",
      "id": "basics",
      "accent": "plum",
      "auto": true,
      "tab": "Drafts",
      "task": "writer"
    },
    {
      "notion": "Case Studies",
      "id": "case-studies",
      "accent": "moss",
      "auto": true,
      "tab": "Case Studies",
      "task": "case-studies"
    },
    {
      "notion": "Talks",
      "id": "talks",
      "accent": "hanko",
      "auto": true,
      "tab": "Talks",
      "task": "talks"
    }
  ]
};
