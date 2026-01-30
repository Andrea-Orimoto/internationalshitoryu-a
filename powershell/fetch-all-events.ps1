$BaseUrl = "https://www.internationalshitoryu.com"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

# Years present on the site
$Years = @(
  "2022","2021","2018","2017","2016","2105","2014","2013","2012","2011"
)

New-Item -ItemType Directory -Force -Path "events" | Out-Null

foreach ($year in $Years) {
  Write-Host "Fetching year $year..."

  $YearDir = "events\$year"
  New-Item -ItemType Directory -Force -Path $YearDir | Out-Null

  $YearUrl = "$BaseUrl/events/$year/"
  $YearIndexPath = "$YearDir\index.html"

  try {
    Invoke-WebRequest $YearUrl -Headers @{ "User-Agent" = $UserAgent } |
      Select-Object -ExpandProperty Content |
      Out-File $YearIndexPath -Encoding utf8
  }
  catch {
    Write-Warning "Failed to fetch year index $YearUrl"
    continue
  }

  # ---- FIXED PART STARTS HERE ----

  $html = Get-Content $YearIndexPath -Raw

  # Build regex safely
  $pattern = "href=`"(/events/$year/[^`"]+/)`""

  $matches = Select-String `
    -InputObject $html `
    -Pattern $pattern `
    -AllMatches

  $urls = @()
  foreach ($m in $matches.Matches) {
    $urls += $m.Groups[1].Value
  }

  $urls = $urls | Sort-Object -Unique

  foreach ($relUrl in $urls) {
    $safeName = ($relUrl -replace "^/events/$year/","" -replace "/$","")
    $fileName = "$safeName.html"
    $filePath = Join-Path $YearDir $fileName
    $fullUrl = "$BaseUrl$relUrl"

    Write-Host "  → Fetching $fullUrl"

    try {
      Invoke-WebRequest $fullUrl -Headers @{ "User-Agent" = $UserAgent } |
        Select-Object -ExpandProperty Content |
        Out-File $filePath -Encoding utf8
    }
    catch {
      Write-Warning "    Failed: $fullUrl"
    }
  }

  # ---- FIXED PART ENDS HERE ----
}

Write-Host "Done."
