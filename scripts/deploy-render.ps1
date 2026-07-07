param(
  [string]$ApiKey = $env:RENDER_API_KEY,
  [string]$ServiceId = $env:RENDER_SERVICE_ID
)

if (-not $ApiKey) {
  $ApiKey = Read-Host -Prompt 'Enter Render API key (rnd_...)'
}

if (-not $ServiceId) {
  $ServiceId = Read-Host -Prompt 'Enter Render Service ID (svc_...)'
}

Write-Host "Triggering Render deploy for service $ServiceId..."

$body = '{"clearCache": true}'

$resp = Invoke-RestMethod -Method Post -Uri "https://api.render.com/v1/services/$ServiceId/deploys" -Headers @{ Authorization = "Bearer $ApiKey"; 'Content-Type' = 'application/json' } -Body $body -ErrorAction Stop

Write-Host "Render response:`n" ($resp | ConvertTo-Json -Depth 4)
