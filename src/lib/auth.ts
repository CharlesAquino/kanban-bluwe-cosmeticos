/**
 * Configuração NextAuth - NEUTRALIZADA
 * 
 * Este arquivo foi neutralizado durante a migração Prisma → Drizzle.
 * A autenticação será reimplementada com Drizzle ORM.
 * 
 * TODO: Reimplementar com Drizzle ORM
 */

import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  // Placeholder - será implementado com Drizzle
  providers: [],
  callbacks: {
    async signIn() {
      // Temporariamente desativado durante migração
      return false
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
