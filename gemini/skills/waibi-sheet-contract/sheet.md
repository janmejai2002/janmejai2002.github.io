<!-- GENERATED from site/harness/registry.mjs by site/harness/generate.mjs. Do not edit; edit the registry and regenerate. -->

# The Google Sheet contract

Sheet ID: `1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0`
https://docs.google.com/spreadsheets/d/1-UcD-C4My_Zp4aH3n-5dB3JQNtDN_MSAK6vTCPt8LY0/edit

**Agent-owned** tabs: Gemini tasks only ever APPEND new rows, never edit or delete existing ones.
**Code-owned** tabs (grey): rewritten every 15 minutes by the Conductor. Read them; never write to them.

| Tab | Owner | Written by | Columns, in order |
|---|---|---|---|
| Radar | agent | radar | Date · Track · Title · Reader Question · Pitch · Keywords · SeoBrief |
| Drafts | agent | writer | Date · Track · Title · DocUrl · Draft · Status · Radar Title |
| Case Studies | agent | case-studies | Date · Track · Title · DocUrl · Draft · Status |
| Talks | agent | talks | Date · Track · Title · DocUrl · Draft · Status |
| News | agent | news | Date · Category · Headline · Summary · Interview Angle · Source |
| Repair Outbox | agent | repairer | Date · Key · Attempt · Title · Draft · Changed · Not Fixed |
| Runs | agent | all | Date · Time · Task · Result · Note |
| Status | code | Conductor | Key · Title · Track · Draft Status · Failure Codes · Blocked Reason · Repair Attempts · Live URL · Updated |
| Repair Queue | code | Conductor | Key · Title · Track · Next Attempt · Failure Codes · Blocked Reason · Playbook · Previous Notes · Current Draft |

## Row keys

Every article row gets a key like `DR-20261111-3fa9c2` (<prefix>-<YYYYMMDD>-<hash>), computed by code from the tab, the Date cell and the Title as first written. Agents never compute keys. The Repairer copies the Key from the Repair Queue row it is fixing.

## Runs tab

Every task appends exactly one row when it finishes: Date | Time | Task | Result | Note. Result is "ok", "partial" or "failed". Task names:

| Task | Name to write | Scheduled (IST) |
|---|---|---|
| Case Studies | case-studies | 01:00 |
| SEO Radar | radar | 03:35 |
| Article Writer | writer | 04:15 |
| News | news | 06:00 |
| Repairer | repairer | 09:00, 19:00 |
| Talks | talks | 13:00 |
