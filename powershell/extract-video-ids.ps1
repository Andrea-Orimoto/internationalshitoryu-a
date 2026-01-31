$BaseUrl   = "https://www.internationalshitoryu.com"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

$InputJson  = "../data/videos.json"
$OutputJson = "../data/videos.enriched.json"

if (-not (Test-Path $InputJson)) {
  Write-Error "Input file not found: $InputJson"
  exit 1
}

$videos = Get-Content $InputJson -Raw | ConvertFrom-Json

foreach ($v in $videos) {
  Write-Host "Processing $($v.id)"

  # Ensure properties exist
  if (-not $v.PSObject.Properties["provider"]) {
    $v | Add-Member -NotePropertyName provider -NotePropertyValue $null
  } else {
    $v.provider = $null
  }

  if (-not $v.PSObject.Properties["videoId"]) {
    $v | Add-Member -NotePropertyName videoId -NotePropertyValue $null
  } else {
    $v.videoId = $null
  }

  if (-not $v.sourceUrl) {
    Write-Warning "No sourceUrl for $($v.id)"
    continue
  }

  try {
    $resp = Invoke-WebRequest `
      -Uri "$BaseUrl$($v.sourceUrl)" `
      -Headers @{ "User-Agent" = $UserAgent } `
      -TimeoutSec 30

    $html = $resp.Content

    if ($html -match "youtube\.com/embed/([a-zA-Z0-9_-]{6,})") {
      $v.provider = "youtube"
      $v.videoId  = $matches[1]
    }
    elseif ($html -match "youtube\.com/watch\?v=([a-zA-Z0-9_-]{6,})") {
      $v.provider = "youtube"
      $v.videoId  = $matches[1]
    }
    elseif ($html -match "youtu\.be/([a-zA-Z0-9_-]{6,})") {
      $v.provider = "youtube"
      $v.videoId  = $matches[1]
    }
    elseif ($html -match "player\.vimeo\.com/video/([0-9]+)") {
      $v.provider = "vimeo"
      $v.videoId  = $matches[1]
    }
    else {
      Write-Warning "No video embed found for $($v.id)"
    }
  }
  catch {
    Write-Warning "Failed to fetch $($v.sourceUrl)"
  }
}

$videos |
  ConvertTo-Json -Depth 6 |
  Out-File $OutputJson -Encoding UTF8

Write-Host "Done"
Write-Host "Output written to $OutputJson"
