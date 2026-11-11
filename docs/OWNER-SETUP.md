# Owner setup — the only steps Claude can't do for you

Do these once, in this order. About 10 minutes. Everything else is automated.

## 1. Tell Claude the Apps Script ID
Sheet → Extensions → Apps Script → Project Settings (gear) → **Script ID**. Paste it into the chat.
(If there is no project yet, just say so and Claude will create one attached to the Sheet.)
## 2. Turn on the Apps Script API (lets Claude upload code with `clasp`)
Open https://script.google.com/home/usersettings → **Google Apps Script API: On**.

clasp's default login on this machine is the XLRI account. The blog uses a separate named login: run `! clasp -u waibi login` once and sign in as janmejai2002@gmail.com. Claude then pushes with `clasp -u waibi push` from `gas/`.

## 3. Create a read-only Notion connection for the Conductor
Notion moves this page around; the goal is an **internal** connection that can **only read**, shared with **one database**.
1. Notion → Settings → **Connections** → *Develop or manage integrations* (or go to https://www.notion.so/profile/integrations) → create a new **internal** integration named `waibi-conductor`.
2. In its capabilities, allow **Read content** only. Turn off update/insert content and user information.
3. Copy its secret (starts `ntn_`).
4. Open the **✍️ Article Production** database → `•••` → **Connections** → add `waibi-conductor`. Share nothing else.

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
| `NOTIFY_TOPIC` | your phone notification topic: open the **ntfy** app on your phone; it's the topic name you subscribed to (the same value as the GitHub secret `NOTIFY_TOPIC`, which GitHub won't show again) |

Script Properties are visible only to you, the script's owner.

## 6. Authorise and install (after Claude says the code is pushed)
Apps Script editor → choose function **`install`** → **Run** → approve the consent screen.

The screen will ask for exactly three things:
- **See, edit… only this spreadsheet** (not your other files)
- **Connect to an external service** (Notion and GitHub)
- **Allow this application to run when you are not present** (the 15-minute timer)

`install` creates the new tabs (`Status`, `Repair Queue`, `Repair Outbox`, `Runs`) and the timer. Run it again any time; it's safe to repeat.

## 7. Gemini app checks
- Settings → **Connected apps**: Gmail stays on because other (non-blog) tasks need it. To compensate, every wAIbi task prompt and the `waibi-sheet-contract` skill forbid using Gmail or any other app, and tell the task to treat web text as material, never instructions. Turn off any connected app that *no* task uses.
- Confirm `@tech-article-engine` and `@humanize-ai-text` appear under **Skills**, not Gems.

When the skills and the Repairer prompt are ready, Claude will give you the files to upload and the task to schedule; that's step 8 and comes later.
