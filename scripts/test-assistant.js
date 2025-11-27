// Teste simples da API do assistente
fetch('/api/assistant/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'Quantos produtos existem?' })
})
.then(r => r.json())
.then(data => console.log('Resposta:', data))
.catch(e => console.error('Erro:', e))
