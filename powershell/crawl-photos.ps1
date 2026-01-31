$BaseUrl = "https://www.internationalshitoryu.com"
$StartPath = "/photos/"
$OutputDir = "photos_dump"

$Visited = @{}
$Queue = New-Object System.Collections.Queue

# Normalize URL
function Normalize-Url($url) {
    if ($url.StartsWith("/")) {
        return "$BaseUrl$url"
    }
    return $url
}

# Convert URL to local file path
function Url-To-Path($url) {
    $uri = [System.Uri]$url
    $path = $uri.AbsolutePath.TrimEnd("/")

    if ($path -eq "") {
        $path = "index"
    }

    return Join-Path $OutputDir ($path + ".html")
}

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$Queue.Enqueue("$BaseUrl$StartPath")

while ($Queue.Count -gt 0) {
    $url = $Queue.Dequeue()

    if ($Visited.ContainsKey($url)) { continue }
    $Visited[$url] = $true

    Write-Host "Fetching $url"

    try {
        $response = curl.exe -L -s $url
    } catch {
        Write-Warning "Failed to fetch $url"
        continue
    }

    if (-not $response) { continue }

    $localPath = Url-To-Path $url
    $localDir = Split-Path $localPath

    New-Item -ItemType Directory -Force -Path $localDir | Out-Null
    Set-Content -Path $localPath -Value $response -Encoding UTF8

    # Extract internal links
    $matches = Select-String -InputObject $response -Pattern 'href="([^"]+)"' -AllMatches

    foreach ($match in $matches.Matches) {
        $href = $match.Groups[1].Value

        if ($href.StartsWith("#")) { continue }
        if ($href.StartsWith("mailto:")) { continue }
        if ($href.StartsWith("http") -and -not $href.StartsWith($BaseUrl)) { continue }
        if ($href -match "\.(jpg|png|gif|pdf)$") { continue }

        $fullUrl = Normalize-Url $href

        if ($fullUrl.StartsWith("$BaseUrl/photos")) {
            $Queue.Enqueue($fullUrl)
        }
    }
}

Write-Host "Crawl complete. Pages saved to $OutputDir"
