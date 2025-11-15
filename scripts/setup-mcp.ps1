Write-Host "🚀 CONFIGURANDO MCP - KANBAN NEXT.JS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow

# Verificar se @modelcontextprotocol/sdk está instalado
try {
    $mcpInstalled = npm list @modelcontextprotocol/sdk 2>$null
    if ($mcpInstalled) {
        Write-Host "✅ @modelcontextprotocol/sdk já instalado" -ForegroundColor Green
    } else {
        Write-Host "📥 Instalando @modelcontextprotocol/sdk..." -ForegroundColor Yellow
        npm install @modelcontextprotocol/sdk
    }
} catch {
    Write-Host "📥 Instalando @modelcontextprotocol/sdk..." -ForegroundColor Yellow
    npm install @modelcontextprotocol/sdk
}

# Verificar se concurrently está instalado
try {
    $concurrentInstalled = npm list concurrently 2>$null
    if ($concurrentInstalled) {
        Write-Host "✅ concurrently já instalado" -ForegroundColor Green
    } else {
        Write-Host "📥 Instalando concurrently..." -ForegroundColor Yellow
        npm install concurrently --save-dev
    }
} catch {
    Write-Host "📥 Instalando concurrently..." -ForegroundColor Yellow
    npm install concurrently --save-dev
}

Write-Host ""
Write-Host "🔧 Verificando estrutura MCP..." -ForegroundColor Yellow

if (Test-Path "src/mcp/server.js") {
    Write-Host "✅ Servidor principal MCP encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Servidor principal MCP não encontrado" -ForegroundColor Red
}

if (Test-Path "src/mcp/database.js") {
    Write-Host "✅ Servidor de banco MCP encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Servidor de banco MCP não encontrado" -ForegroundColor Red
}

if (Test-Path "src/mcp/api.js") {
    Write-Host "✅ Servidor de APIs MCP encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Servidor de APIs MCP não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "⚙️ Configuração MCP:" -ForegroundColor Yellow
if (Test-Path "mcp.json") {
    Write-Host "✅ mcp.json configurado" -ForegroundColor Green
} else {
    Write-Host "❌ mcp.json não encontrado" -ForegroundColor Red
}

if (Test-Path "src/mcp/README.md") {
    Write-Host "✅ Documentação MCP criada" -ForegroundColor Green
} else {
    Write-Host "❌ Documentação MCP não encontrada" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Scripts disponíveis:" -ForegroundColor Yellow
Write-Host "npm run mcp:serve     - Servidor principal" -ForegroundColor White
Write-Host "npm run mcp:database  - Servidor de banco" -ForegroundColor White
Write-Host "npm run mcp:api       - Servidor de APIs" -ForegroundColor White
Write-Host "npm run mcp:all       - Todos os servidores" -ForegroundColor White
Write-Host "npm run mcp:setup     - Setup completo" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Para usar no VS Code/Cursor:" -ForegroundColor Cyan
Write-Host "Configure o MCP no arquivo de configuração do IDE" -ForegroundColor White
Write-Host "apontando para os servidores em src/mcp/" -ForegroundColor White

Write-Host ""
Write-Host "🎊 MCP CONFIGURADO COM SUCESSO!" -ForegroundColor Magenta
Write-Host "Agora você pode usar os servidores MCP com modelos de IA!" -ForegroundColor White
