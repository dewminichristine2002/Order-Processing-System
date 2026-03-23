param(
  [int]$Port = 8080
)

$connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
  Write-Host "No process is listening on port $Port."
  exit 0
}

$processId = $connections | Select-Object -First 1 -ExpandProperty OwningProcess
Write-Host "Stopping process on port $Port (PID $processId)..."
Stop-Process -Id $processId -Force
Write-Host "Stopped."
