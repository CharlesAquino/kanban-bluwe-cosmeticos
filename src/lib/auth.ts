/**
 * Configuração básica do NextAuth
 * Temporário até implementação completa
 */

import { NextAuthOptions } from 'next-auth'

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
