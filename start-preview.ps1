$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$previewUrl = 'http://127.0.0.1:8830/'
$logRoot = Join-Path $projectRoot 'build'
New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

function Test-Preview {
    try {
        $probe = & curl.exe --noproxy '*' --connect-timeout 1 --max-time 2 --silent --fail $previewUrl 2>$null
        return ($LASTEXITCODE -eq 0 -and ($probe -join "`n") -match '<title>Floorplanning Studio</title>')
    } catch { return $false }
}

if (-not (Test-Preview)) {
    $pythonExe = (Get-Command python.exe -ErrorAction Stop).Source
    $serverPath = Join-Path $projectRoot 'scripts\serve.py'
    $previewProcess = Start-Process -FilePath $pythonExe -ArgumentList @('"' + $serverPath + '"', '--port', '8830') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logRoot 'preview.stdout.log') -RedirectStandardError (Join-Path $logRoot 'preview.stderr.log') -PassThru
    $previewProcess.Id | Set-Content -LiteralPath (Join-Path $logRoot 'preview.pid')
    $ready = $false
    for ($attempt = 0; $attempt -lt 15; $attempt++) {
        if (Test-Preview) { $ready = $true; break }
        if ($previewProcess.HasExited) { break }
        Start-Sleep -Milliseconds 300
    }
    if (-not $ready) {
        throw "Local preview did not respond. See build\preview.stderr.log. If port 8830 belongs to an earlier restricted process, stop that process and retry from a normal local terminal."
    }
}
Write-Output "Ready (HTTP checked): $previewUrl"
