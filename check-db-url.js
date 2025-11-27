// Script para verificar qual DATABASE_URL o Node está vendo
require('dotenv').config()

console.log('=== DATABASE_URL ATUAL ===')
console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('=========================')
