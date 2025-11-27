// Carregar variáveis de ambiente
require('dotenv').config()

// Debug script para verificar variáveis de ambiente
console.log('=== DEBUG VARIÁVEIS DE AMBIENTE ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET')
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'NOT_SET')
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT_SET')
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT_SET')
console.log('LLAMA_ENDPOINT:', process.env.LLAMA_ENDPOINT ? 'SET' : 'NOT_SET')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT_SET')
console.log('=====================================')
