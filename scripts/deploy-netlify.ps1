param(
  [string]$NetlifyToken = $env:NETLIFY_AUTH_TOKEN,
  [string]$NetlifySiteId = $env:NETLIFY_SITE_ID
)

if (-not $NetlifyToken) {
  $NetlifyToken = Read-Host -Prompt 'Enter Netlify personal access token' -AsSecureString | ConvertFrom-SecureString
  # Convert back for use
  $NetlifyToken = (ConvertTo-SecureString $NetlifyToken) | ConvertFrom-SecureString
}

if (-not $NetlifySiteId) {
  $NetlifySiteId = Read-Host -Prompt 'Enter Netlify Site ID'
}

Write-Host "Deploying frontend to Netlify site $NetlifySiteId..."

# Ensure dist exists
if (-not (Test-Path -Path "frontend/dist")) {
  Write-Host "Building frontend..."
  Push-Location frontend
  npm install
  npm run build
  Pop-Location
}

# Use netlify-cli if available
try {
  npx netlify-cli deploy --dir=frontend/dist --site=$NetlifySiteId --auth=$NetlifyToken --prod
} catch {
  Write-Error "Netlify deploy failed: $_"
}
