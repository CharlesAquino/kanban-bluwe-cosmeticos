'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Configurações otimizadas para evitar refetching excessivo
                staleTime: 1000 * 60, // Dados considerados frescos por 1 minuto
                refetchOnWindowFocus: true, // Recarregar ao focar na janela (bom para UX)
                retry: 2, // Tentar 2 vezes antes de falhar
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
