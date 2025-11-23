/**
 * Configuração básica do NextAuth
 * Temporário até implementação completa
 */

import { NextAuthOptions } from 'next-auth'

// Mock session para testes
export const mockSession = {
  user: {
    id: 'user1',
    name: 'Admin',
    email: 'admin@bluwe.com',
    image: null
  },
  expires: '2024-12-31T23:59:59.999Z'
}

export const authOptions: NextAuthOptions = {
  // Configuração temporária
  // TODO: Implementar providers completos
  providers: [],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

// Mock getServerSession para testes
export const getServerSession = async () => {
  return mockSession
}
