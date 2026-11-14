# Stop on errors (like set -e)
$ErrorActionPreference = "Stop"
# PowerShell 7.3+: also make failing native commands (az, pip...) stop the script
$PSNativeCommandUseErrorActionPreference = $true

# Azure CLI
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    winget install --exact --id Microsoft.AzureCLI
    Write-Host "Azure CLI installed. Open a NEW terminal and rerun this script."
    exit 0
}

az login

# Python 3.13 (Windows uses the 'py' launcher)
$hasPy313 = $false
if (Get-Command py -ErrorAction SilentlyContinue) {
    py -3.13 --version *> $null
    $hasPy313 = ($LASTEXITCODE -eq 0)
}
if (-not $hasPy313) {
    winget install --exact --id Python.Python.3.13
    Write-Host "Python installed. Open a NEW terminal and rerun this script."
    exit 0
}

# Virtual environment
if (-not (Test-Path "env")) {
    py -3.13 -m venv env
}

# Windows venvs use Scripts\python.exe, not bin/python
& .\env\Scripts\python.exe -m pip install -r requirements.txt

& .\env\Scripts\python.exe -m uvicorn main:app --reload