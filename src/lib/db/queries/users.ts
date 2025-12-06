/**
 * Queries Drizzle para Users
 */

import { db, users } from '../../db-unified'
import { eq, desc } from 'drizzle-orm'

export const userQueries = {
  /**
   * Criar novo usuário
   */
  async create(data: {
    email: string
    name?: string
    password: string
    role?: string
    image?: string
  }) {
    const [user] = await db
      .insert(users)
      .values({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: data.email,
        name: data.name,
        password: data.password,
        role: (data.role as any) || 'VIEWER',
        image: data.image,
      })
      .returning()

    return user
  },

  /**
   * Buscar usuário por email
   */
  async getByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    return user || null
  },

  /**
   * Buscar usuário por ID
   */
  async getById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))

    return user || null
  },

  /**
   * Buscar todos os usuários
   */
  async getAll() {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
  },

  /**
   * Atualizar usuário
   */
  async update(
    id: string,
    data: {
      name?: string
      password?: string
      role?: string
      image?: string
      emailVerified?: Date
    }
  ) {
    const [updated] = await db
      .update(users)
      .set({
        name: data.name,
        password: data.password,
        role: data.role as any,
        image: data.image,
        emailVerified: data.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return updated
  },

  /**
   * Deletar usuário
   */
  async delete(id: string) {
    await db.delete(users).where(eq(users.id, id))
    return true
  },

  /**
   * Buscar usuários por role
   */
  async getByRole(role: string) {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role as any))
      .orderBy(desc(users.createdAt))
  },
}
