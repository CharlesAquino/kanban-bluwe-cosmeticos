// Teste direto da API de produtos
export async function testProductAPI() {
  try {
    console.log('🧪 TESTE: Iniciando teste da API de produtos...')

    // Teste 1: Listar produtos (deve retornar array vazio inicialmente)
    console.log('📋 Teste 1: Listando produtos existentes...')
    const listResponse = await fetch('/api/products')
    const listData = await listResponse.json()
    console.log('Lista inicial:', listData)

    // Teste 2: Criar produto de teste
    console.log('➕ Teste 2: Criando produto de teste...')
    const createResponse = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Produto Teste API',
        op: 'OP999',
        batch: 'L999',
        quantity: 5
      }),
    })

    const createData = await createResponse.json()
    console.log('Produto criado:', createData)

    // Teste 3: Listar produtos novamente (deve incluir o produto criado)
    console.log('📋 Teste 3: Listando produtos após criação...')
    const listAfterResponse = await fetch('/api/products')
    const listAfterData = await listAfterResponse.json()
    console.log('Lista após criação:', listAfterData)

    return {
      listBefore: listData,
      createResult: createData,
      listAfter: listAfterData
    }
  } catch (error: unknown) {
    console.error('❌ Erro no teste da API:', error)
    return { error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
