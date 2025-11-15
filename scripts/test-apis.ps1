Write-Host "🧪 Testando APIs do Kanban..." -ForegroundColor Cyan

Write-Host ""
Write-Host "📊 Testando API Stats:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/stats" -UseBasicParsing
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Erro ao acessar API stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📦 Testando API Products:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -UseBasicParsing
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2
} catch {
    Write-Host "❌ Erro ao acessar API products: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Teste concluído!" -ForegroundColor Green
