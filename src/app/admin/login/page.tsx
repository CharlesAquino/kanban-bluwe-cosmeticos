'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Página neutra: /admin/login redireciona automaticamente para /admin.
// Mantida apenas para não quebrar links antigos.
export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin')
  }, [router])

  return null
}
