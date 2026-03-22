param(
  [int]$Port = 8081
)

$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

Write-Host "Mock Order Service listening on $prefix" -ForegroundColor Green
Write-Host "Expecting POST /orders/stock-updated" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

try {
  $listener.Start()

  while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath
    $method = $request.HttpMethod

    $body = $null
    if ($request.HasEntityBody) {
      $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
      $body = $reader.ReadToEnd()
      $reader.Close()
    }

    Write-Host "[$(Get-Date -Format o)] $method $path" -ForegroundColor Cyan
    if ($body) {
      Write-Host $body
    }

    if ($method -eq "POST" -and $path -eq "/orders/stock-updated") {
      $payload = [System.Text.Encoding]::UTF8.GetBytes("OK")
      $response.StatusCode = 200
      $response.ContentType = "text/plain"
      $response.OutputStream.Write($payload, 0, $payload.Length)
    } else {
      $payload = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
      $response.StatusCode = 404
      $response.ContentType = "text/plain"
      $response.OutputStream.Write($payload, 0, $payload.Length)
    }

    $response.Close()
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
