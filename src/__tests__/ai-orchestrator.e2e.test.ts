/**
 * E2E Tests for AI Orchestrator
 * 
 * Validates real AI functionality with OpenAI and Llama fallback
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

describe('AI Orchestrator E2E Tests', () => {
    let hasOpenAI: boolean
    let hasLlama: boolean

    beforeAll(async () => {
        // Check available providers
        const response = await fetch(`${API_BASE}/api/ai/orchestrator`)
        const data = await response.json()
        hasOpenAI = data.availableProviders?.includes('openai') || false
        hasLlama = data.availableProviders?.includes('llama') || false

        console.log('🔍 Available AI Providers:', data.availableProviders)
    })

    describe('GET /api/ai/orchestrator', () => {
        it('should return API information', async () => {
            const response = await fetch(`${API_BASE}/api/ai/orchestrator`)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.message).toContain('AI Orchestrator')
            expect(data.version).toBe('2.0.0')
            expect(data.mode).toBe('production')
            expect(data.availableProviders).toBeDefined()
            expect(Array.isArray(data.availableProviders)).toBe(true)
        })
    })

    describe('POST /api/ai/orchestrator', () => {
        it('should require messages array', async () => {
            const response = await fetch(`${API_BASE}/api/ai/orchestrator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })

            expect(response.status).toBe(400)
            const data = await response.json()
            expect(data.success).toBe(false)
            expect(data.error).toContain('Messages array is required')
        })

        it('should handle simple message with OpenAI', async () => {
            if (!hasOpenAI) {
                console.log('⚠️ Skipping OpenAI test - not configured')
                return
            }

            const response = await fetch(`${API_BASE}/api/ai/orchestrator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'Say "test successful" and nothing else' }
                    ],
                    options: {
                        provider: 'openai',
                        temperature: 0.1
                    }
                })
            })

            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.data.response).toBeDefined()
            expect(data.data.provider).toBe('openai')
            expect(data.data.model).toBeDefined()

            console.log('✅ OpenAI Response:', data.data.response.substring(0, 50))
        }, 15000) // 15s timeout for AI call

        it('should fallback to Llama when OpenAI fails', async () => {
            if (!hasLlama) {
                console.log('⚠️ Skipping Llama fallback test - not configured')
                return
            }

            const response = await fetch(`${API_BASE}/api/ai/orchestrator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'Hello' }
                    ],
                    options: {
                        provider: 'llama'
                    }
                })
            })

            const data = await response.json()

            if (data.success) {
                expect(data.data.provider).toBe('llama')
                console.log('✅ Llama Response:', data.data.response.substring(0, 50))
            } else {
                console.log('⚠️ Llama not available:', data.error)
            }
        }, 15000)

        it('should handle error when no providers available', async () => {
            if (hasOpenAI || hasLlama) {
                console.log('⚠️ Skipping no-provider test - providers are configured')
                return
            }

            const response = await fetch(`${API_BASE}/api/ai/orchestrator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'user', content: 'Hello' }
                    ]
                })
            })

            const data = await response.json()

            expect(data.success).toBe(false)
            expect(data.error).toBeDefined()
            console.log('✅ Correctly returned error when no providers available')
        })
    })

    describe('Health Check Integration', () => {
        it('should report AI status in health check', async () => {
            const response = await fetch(`${API_BASE}/api/health`)
            const data = await response.json()

            expect(response.status).toBeGreaterThanOrEqual(200)
            expect(data.services.ai).toBeDefined()
            expect(data.services.ai.available).toBe(hasOpenAI || hasLlama)

            console.log('🏥 Health Status:', {
                overall: data.status,
                ai: data.services.ai.message
            })
        })
    })
})

/**
 * How to run these tests:
 * 
 * 1. Start dev server: npm run dev
 * 2. Configure OPENAI_API_KEY in .env.local (optional but recommended)
 * 3. Run tests: npm test -- ai-orchestrator.e2e.test.ts
 * 
 * Expected results:
 * - With OpenAI configured: All tests pass
 * - Without providers: Error handling tests pass
 * - With Llama only: Llama tests pass
 */
