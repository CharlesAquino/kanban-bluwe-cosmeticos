# Pre-commit Test Script (PowerShell)
# Executa testes automaticamente antes de cada commit
# Previne bugs em produção

Write-Host "🧪 INICIANDO TESTES PRÉ-COMMIT..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. Verificar build
Write-Host "📦 Testando build..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Build: OK" -ForegroundColor Green
} else {
  Write-Host "❌ Build: FALHOU" -ForegroundColor Red
  exit 1
}

# 2. Verificar linting
Write-Host "🔍 Testando linting..." -ForegroundColor Yellow
npm run lint 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠️  Linting: Avisos (não bloqueante)" -ForegroundColor Yellow
}

# 3. Verificar Dockerfile
Write-Host "🐳 Validando Dockerfile..." -ForegroundColor Yellow
if (Test-Path "Dockerfile") {
  Write-Host "✅ Dockerfile: Encontrado" -ForegroundColor Green
} else {
  Write-Host "❌ Dockerfile: NÃO ENCONTRADO" -ForegroundColor Red
  exit 1
}

# 4. Verificar dependências críticas
Write-Host "📚 Verificando dependências..." -ForegroundColor Yellow
$packageJson = Get-Content package.json | ConvertFrom-Json
if ($packageJson.dependencies.tailwindcss -or $packageJson.devDependencies.tailwindcss) {
  Write-Host "✅ Tailwind: Presente" -ForegroundColor Green
} else {
  Write-Host "❌ Tailwind: FALTANDO" -ForegroundColor Red
  exit 1
}

# 5. Verificar estrutura de pastas
Write-Host "📁 Verificando estrutura..." -ForegroundColor Yellow
$requiredDirs = @("src", "src/app", "src/components", "public")
$allExist = $true
foreach ($dir in $requiredDirs) {
  if (Test-Path $dir) {
    Write-Host "  ✅ $dir" -ForegroundColor Green
  } else {
    Write-Host "  ❌ $dir: FALTANDO" -ForegroundColor Red
    $allExist = $false
  }
}

if (-not $allExist) {
  exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Commit autorizado para produção" -ForegroundColor Green
Write-Host ""
