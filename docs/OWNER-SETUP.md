# Owner setup — the only steps Claude can't do for you

Do these once, in this order. About 10 minutes. Everything else is automated.

## 1. Tell Claude the Apps Script ID
Sheet → Extensions → Apps Script → Project Settings (gear) → **Script ID**. Paste it into the chat.
(If there is no project yet, just say so and Claude will create one attached to the Sheet.)

## 2. Turn on the Apps Script API (lets Claude upload code with `clasp`)
Open https://script.google.com/home/usersettings → **Google Apps Script API: On**.

## 3. Create a read-only Notion connection for the Conductor
1. https://www.notion.so/profile/integrations → **New integration** → name `waibi-conductor`, type Internal.
2. Capabilities: tick **Read content** only. Untick Update content, Insert content, and everything under User information.
3. Save, copy the **Internal Integration Secret**.
4. In Notion, open the **✍️ Article Production** database → `•••` → **Connections** → add `waibi-conductor`. Share nothing else.

## 4. Create a GitHub token that can only start workflows
1. https://github.com/settings/personal-access-tokens/new
2. Name `waibi-conductor`, Expiration **90 days**.
3. Repository access: **Only select repositories** → `janmejai2002.github.io`.
4. Permissions → Repository → **Actions: Read and write**. Nothing else (Metadata: Read is added automatically).
5. Generate and copy.

This token can trigger the existing workflows but cannot change code, read secrets, or push.

## 5. Put the two secrets in Script Properties
Apps Script editor → Project Settings → Script Properties → Add:

| Property | Value |
|---|---|
| `NOTION_TOKEN` | the secret from step 3 |
| `GITHUB_TOKEN` | the token from step 4 |
| `NOTIFY_TOPIC` | the same value as the GitHub secret of that name (your phone notification topic) |

Script Properties are visible only to you, the script's owner.

## 6. Authorise and install (after Claude says the code is pushed)
Apps Script editor → choose function **`install`** → **Run** → approve the consent screen.

The screen will ask for exactly three things:
- **See, edit… only this spreadsheet** (not your other files)
- **Connect to an external service** (Notion and GitHub)
- **Allow this application to run when you are not present** (the 15-minute timer)

`install` creates the new tabs (`Status`, `Repair Queue`, `Repair Outbox`, `Runs`) and the timer. Run it again any time; it's safe to repeat.

## 7. Gemini app checks
- Settings → **Connected apps**: keep Google Sheets/Drive, Gemini Notebook and YouTube on. Turn **Gmail off** (and anything else the tasks don't use).
- Confirm `@tech-article-engine` and `@humanize-ai-text` appear under **Skills**, not Gems.

When the skills and the Repairer prompt are ready, Claude will give you the files to upload and the task to schedule; that's step 8 and comes later.
