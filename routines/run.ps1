<#
  Headless runner for one blog routine.

    pwsh routines/run.ps1 -Routine business-radar
    pwsh routines/run.ps1 -Routine daily-ai-seo-radar -Model haiku

  What it does differently from the in-app `scheduled-tasks` runner:
    * CLAUDE_CONFIG_DIR -> routines/config  (empty agents/, 2 skills, no plugins)
    * --strict-mcp-config --mcp-config routines/mcp.json  (zero MCP servers)
    * --allowedTools is an explicit allowlist, not "everything"
    * --output-format json, so the real token `usage` is captured per run

  The prompt is still the single source of truth at
  ~/.claude/scheduled-tasks/<Routine>/SKILL.md — this only changes HOW it runs.

  This does NOT touch the in-app scheduled tasks. Run it by hand first, compare
  the Notion result to a normal run, and only then wire it into Task Scheduler
  (see routines/schtasks.md) and disable the in-app twin.
#>
param(
  [Parameter(Mandatory = $true)][string]$Routine,
  [string]$Model = "sonnet",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$root      = Split-Path -Parent $PSScriptRoot          # repo root
$promptDir = Join-Path $HOME ".claude\scheduled-tasks\$Routine"
$prompt    = Join-Path $promptDir "SKILL.md"
$runsDir   = Join-Path $PSScriptRoot "runs"
$stamp     = (Get-Date).ToString("yyyyMMdd-HHmmss")
$outFile   = Join-Path $runsDir "$Routine-$stamp.json"

if (-not (Test-Path $prompt)) { throw "No prompt at $prompt" }
New-Item -ItemType Directory -Force -Path $runsDir | Out-Null

$env:CLAUDE_CONFIG_DIR = Join-Path $PSScriptRoot "config"

$promptText = Get-Content -Raw $prompt

$claudeArgs = @(
  "-p", $promptText,
  "--strict-mcp-config",
  "--mcp-config", (Join-Path $PSScriptRoot "mcp.json"),
  "--allowedTools", "Bash WebSearch WebFetch Read Write Edit Glob Grep Skill",
  "--model", $Model,
  "--permission-mode", "bypassPermissions",
  "--output-format", "json"
)

if ($DryRun) {
  Write-Host "CLAUDE_CONFIG_DIR = $env:CLAUDE_CONFIG_DIR"
  Write-Host "claude $($claudeArgs -join ' ')"
  Write-Host "(prompt: $($promptText.Length) chars from $prompt)"
  exit 0
}

Push-Location $root
try {
  claude @claudeArgs | Tee-Object -FilePath $outFile

  # Pull the usage block out of the JSON result and append a telemetry row.
  try {
    $res = Get-Content -Raw $outFile | ConvertFrom-Json
    $usage = $res.usage
    if ($usage) {
      $line = @{
        routine = $Routine
        ts      = (Get-Date).ToString("o")
        model   = $Model
        in      = $usage.input_tokens
        out     = $usage.output_tokens
        cache_read = $usage.cache_read_input_tokens
      } | ConvertTo-Json -Compress
      Add-Content -Path (Join-Path $PSScriptRoot "runs.jsonl") -Value $line
      Write-Host "telemetry: $line"
    }
  } catch {
    Write-Warning "could not parse usage from $outFile : $_"
  }
} finally {
  Pop-Location
}
