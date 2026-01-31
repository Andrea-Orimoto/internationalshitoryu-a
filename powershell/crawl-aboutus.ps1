# CONFIG
$BaseUrl = "https://www.internationalshitoryu.com"
$StartPath = "/aboutus/"
$OutputDir = "aboutus_dump"

# Tracking
$Visited = @{}
$Queue = New-Object System.Collections.Queue

function Normalize-Url($url) {
    if ($url.StartsWith("/")) {
        return "$BaseUrl$url"
    }
    return $url
}

function Url-To-Path($url) {
    $uri = [System.Uri]$url
    $path = $uri.AbsolutePath.TrimEnd("/")

    if ($path -eq "") {
        $path = "index"
    }

    return Join-Path $OutputDir ($path + ".html")
}

# Ensure output dir
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Start with About Us
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

    # Find internal links only in About Us
    $matches = Select-String -InputObject $response -Pattern 'href="([^"]+)"' -AllMatches

    foreach ($match in $matches.Matches) {
        $href = $match.Groups[1].Value

        if ($href.StartsWith("#") -or $href.StartsWith("mailto:")) { continue }
        if ($href.StartsWith("http") -and -not $href.StartsWith($BaseUrl)) { continue }
        
        $fullUrl = Normalize-Url $href

        if ($fullUrl.StartsWith("$BaseUrl/aboutus")) {
            $Queue.Enqueue($fullUrl)
        }
    }
}

Write-Host "`nDone. Pages saved to $OutputDir"
