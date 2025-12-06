# Pre-commit Security Check (PowerShell)
# Roda antes de cada commit para detectar segredos

Write-Host "🔒 Running pre-commit security checks..." -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$FoundIssues = $false

# Get staged files
$StagedFiles = git diff --cached --name-only --diff-filter=ACM

if (-not $StagedFiles) {
    Write-Host "✅ No files to check" -ForegroundColor Green
    exit 0
}

Write-Host "🔍 Checking for common secret patterns..." -ForegroundColor Cyan

# Patterns to check
$Patterns = @{
    'redis://[^:]+:[^*]+@' = 'Redis URL with password'
    'postgresql://[^:]+:[^*]+@' = 'PostgreSQL URL with password'
    'mongodb://[^:]+:[^*]+@' = 'MongoDB URL with password'
    'sk-[a-zA-Z0-9]{48}' = 'OpenAI API Key'
    'ghp_[a-zA-Z0-9]{36}' = 'GitHub Personal Access Token'
    'AKIA[0-9A-Z]{16}' = 'AWS Access Key'
    'AIza[0-9A-Za-z\-_]{35}' = 'Google API Key'
}

# Placeholders to ignore
$Placeholders = @(
    '\*\*\*',
    'COPIE_DO',
    'sua-chave',
    'seu_token',
    'example',
    'localhost'
)

foreach ($file in $StagedFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            foreach ($pattern in $Patterns.Keys) {
                if ($content -match $pattern) {
                    # Check if it's a placeholder
                    $isPlaceholder = $false
                    foreach ($placeholder in $Placeholders) {
                        if ($content -match $placeholder) {
                            $isPlaceholder = $true
                            break
                        }
                    }
                    
                    if (-not $isPlaceholder) {
                        Write-Host "❌ Found $($Patterns[$pattern]) in: $file" -ForegroundColor Red
                        $FoundIssues = $true
                    }
                }
            }
        }
    }
}

# Check for .env files being committed
foreach ($file in $StagedFiles) {
    if ($file -match '\.env(\.|$)' -and $file -notmatch '\.env\.example$') {
        Write-Host "❌ Attempting to commit .env file: $file" -ForegroundColor Red
        Write-Host "   .env files should not be committed!" -ForegroundColor Yellow
        $FoundIssues = $true
    }
}

if ($FoundIssues) {
    Write-Host ""
    Write-Host "🚨 SECURITY ISSUE: Potential secrets found!" -ForegroundColor Red
    Write-Host "Please review the files above and remove any sensitive data." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you believe this is a false positive, you can:" -ForegroundColor Yellow
    Write-Host "1. Use placeholders like: ***SENHA***, ***TOKEN***, COPIE_DO_RAILWAY" -ForegroundColor Yellow
    Write-Host "2. Add the pattern to .gitleaks.toml allowlist" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All security checks passed!" -ForegroundColor Green
exit 0
