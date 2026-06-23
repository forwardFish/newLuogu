param(
  [int]$Port = 9223,
  [string]$Uid = "1024038",
  [string]$ProfileRoot = ".tmp\luogu-chrome"
)

$ErrorActionPreference = "Stop"

$candidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)

$chrome = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $chrome) {
  throw "Chrome executable not found. Please install Google Chrome first."
}

$profilePath = Join-Path (Resolve-Path ".").Path $ProfileRoot
New-Item -ItemType Directory -Force -Path $profilePath | Out-Null

$startUrl = "https://www.luogu.com.cn/user/$Uid"
$args = @(
  "--remote-debugging-port=$Port",
  "--remote-debugging-address=127.0.0.1",
  "--remote-allow-origins=*",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=$profilePath",
  $startUrl
)

Start-Process -FilePath $chrome -ArgumentList $args
Write-Host "Chrome started for Luogu."
Write-Host "CDP URL: http://127.0.0.1:$Port"
Write-Host "Profile: $profilePath"
Write-Host "Please log in to Luogu in the opened Chrome window, then run:"
Write-Host "pnpm luogu:crawl -- --uid $Uid --cdp-url http://127.0.0.1:$Port --max-pages 20"
