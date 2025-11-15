@echo off

REM Script para configurar banco de dados de teste (Windows)
echo 🚀 Configurando banco de dados de teste...

REM Gerar cliente Prisma
echo 📦 Gerando cliente Prisma...
npx prisma generate

REM Reset e criar banco de teste
echo 🗄️ Criando banco de dados de teste...
npx prisma db push --force-reset

REM Executar seeds de teste (se houver)
echo 🌱 Executando seeds de teste...
REM npx prisma db seed

echo ✅ Banco de dados de teste configurado!
echo.
echo 📋 Para executar os testes:
echo   npm test              - Testes unitários
echo   npm run test:e2e      - Testes end-to-end
echo   npm run test:coverage - Testes com cobertura
