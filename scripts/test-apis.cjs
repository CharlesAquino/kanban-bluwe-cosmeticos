/**
 * Script para testar as APIs restauradas
 * Uso: node scripts/test-apis.cjs
 */

const http = require('http')

const BASE_URL = 'http://localhost:3000'

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path)
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          })
        } catch {
          resolve({
            status: res.statusCode,
            data: data,
          })
        }
      })
    })

    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function runTests() {
  console.log('🧪 Iniciando testes das APIs...\n')

  const tests = [
    {
      name: 'GET /api/quality/tests',
      path: '/api/quality/tests',
      method: 'GET',
    },
    {
      name: 'GET /api/quality/nc',
      path: '/api/quality/nc',
      method: 'GET',
    },
    {
      name: 'GET /api/monitoring/stats',
      path: '/api/monitoring/stats',
      method: 'GET',
    },
    {
      name: 'GET /api/audit/events',
      path: '/api/audit/events',
      method: 'GET',
    },
    {
      name: 'POST /api/quality/tests',
      path: '/api/quality/tests',
      method: 'POST',
      body: {
        productId: 'test-prod-001',
        productName: 'Teste Produto',
        batch: 'LOTE-TEST-001',
        stage: 'PRODUCAO_1KG',
        parameter: 'pH',
        targetValue: 7.0,
        tolMin: 6.5,
        tolMax: 7.5,
        measuredValue: 7.2,
        unit: 'pH',
        operator: 'Teste Operador',
        notes: 'Teste automático',
      },
    },
    {
      name: 'POST /api/quality/nc',
      path: '/api/quality/nc',
      method: 'POST',
      body: {
        productId: 'test-prod-001',
        productName: 'Teste Produto',
        batch: 'LOTE-TEST-001',
        stage: 'PRODUCAO_1KG',
        type: 'qualidade',
        severity: 'minor',
        description: 'Teste automático de não-conformidade',
        responsible: 'Teste',
      },
    },
    {
      name: 'POST /api/monitoring/stats',
      path: '/api/monitoring/stats',
      method: 'POST',
      body: {
        metricName: 'test_metric',
        metricValue: 42.5,
        unit: '%',
        category: 'test',
      },
    },
    {
      name: 'POST /api/audit/events',
      path: '/api/audit/events',
      method: 'POST',
      body: {
        action: 'test',
        entityType: 'product',
        entityId: 'test-prod-001',
        userName: 'Teste',
      },
    },
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`📍 Testando: ${test.name}`)
      const result = await makeRequest(test.path, test.method, test.body)

      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ PASSOU (${result.status})`)
        console.log(`   Resposta: ${JSON.stringify(result.data).substring(0, 100)}...\n`)
        passed++
      } else {
        console.log(`❌ FALHOU (${result.status})`)
        console.log(`   Erro: ${JSON.stringify(result.data).substring(0, 100)}...\n`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ERRO: ${error.message}\n`)
      failed++
    }
  }

  console.log(`\n📊 RESULTADO FINAL:`)
  console.log(`✅ Passou: ${passed}/${tests.length}`)
  console.log(`❌ Falhou: ${failed}/${tests.length}`)

  if (failed === 0) {
    console.log(`\n🎉 TODOS OS TESTES PASSARAM!`)
    process.exit(0)
  } else {
    console.log(`\n⚠️ ALGUNS TESTES FALHARAM`)
    process.exit(1)
  }
}

runTests()
