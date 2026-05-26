param(
  [int]$Port = 4190,
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg" = "image/svg+xml"
  ".txt" = "text/plain; charset=utf-8"
  ".yml" = "text/yaml; charset=utf-8"
  ".webm" = "video/webm"
  ".mp4" = "video/mp4"
}

function Resolve-SitePath {
  param([string]$RequestPath)

  $relativePath = [Uri]::UnescapeDataString($RequestPath).TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = "index.html"
  }

  $filePath = $Root
  foreach ($segment in ($relativePath -split "/")) {
    if (-not [string]::IsNullOrWhiteSpace($segment)) {
      $filePath = Join-Path $filePath $segment
    }
  }

  $resolvedPath = [IO.Path]::GetFullPath($filePath)
  $resolvedRoot = [IO.Path]::GetFullPath($Root).TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
  if (-not $resolvedPath.StartsWith($resolvedRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Forbidden"
  }

  if (Test-Path -LiteralPath $resolvedPath -PathType Container) {
    $resolvedPath = Join-Path $resolvedPath "index.html"
  }

  return $resolvedPath
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Shixing site preview: http://localhost:$Port"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $path = Resolve-SitePath -RequestPath $context.Request.Url.AbsolutePath
      if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        $context.Response.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
      } else {
        $context.Response.StatusCode = 200
        $extension = [IO.Path]::GetExtension($path).ToLowerInvariant()
        $context.Response.ContentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
        $context.Response.Headers.Set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
        $bytes = [IO.File]::ReadAllBytes($path)
      }

      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      $context.Response.StatusCode = 500
      $bytes = [Text.Encoding]::UTF8.GetBytes("Server error")
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Error $_
    } finally {
      $context.Response.Close()
    }
  }
} finally {
  $listener.Stop()
}
