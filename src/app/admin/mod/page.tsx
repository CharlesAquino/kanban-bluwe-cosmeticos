'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Rota antiga: /admin/mod redireciona automaticamente para /cms/mod
export default function AdminModRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/cms/mod')
  }, [router])

  return null
}
