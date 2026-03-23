param(
  [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'

# Stop anything already listening on the port to avoid H2 file lock errors.
$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($connections) {
  $processId = $connections | Select-Object -First 1 -ExpandProperty OwningProcess
  Write-Host "Port $Port is in use by PID $processId. Stopping it..."
  Stop-Process -Id $processId -Force
  Start-Sleep -Seconds 1
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $projectRoot

Write-Host "Starting inventory-service on port $Port..."
$env:PORT = "$Port"

# Prefer Maven wrapper for consistent builds.
if (Test-Path (Join-Path $projectRoot 'mvnw.cmd')) {
  .\mvnw.cmd spring-boot:run
} else {
  mvn spring-boot:run
}
