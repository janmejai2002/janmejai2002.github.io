<#
  The pipeline watchdog. Run every ~10 minutes from Task Scheduler while the
  laptop is on:

    schtasks /create /tn "waibi\manager" /sc minute /mo 10 ^
      /tr "pwsh -NoProfile -File C:\Users\Janmejai\PluginsClaude\routines\manager.ps1" /rl LIMITED /f

  What it does each tick: run doctor.mjs, retrigger a failed deploy/publish once
  (rate-limited, logged), push one alert for anything a human needs to see, and
  once a day send a plain-language digest. It never writes Notion, never runs
  git, never sets Draft Status. Full contract in site/scripts/manager.mjs.

  Test first:  pwsh routines/manager.ps1 -DryRun
#>
param([switch]$DryRun, [switch]$Digest)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$env:CLAUDE_CONFIG_DIR = Join-Path $PSScriptRoot "config"

$args = @("scripts/manager.mjs")
if ($DryRun) { $args += "--dry-run" }
if ($Digest) { $args += "--digest" }

Push-Location (Join-Path $repoRoot "site")
try {
  node @args
} finally {
  Pop-Location
}
