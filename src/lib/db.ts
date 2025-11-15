import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | undefined

function ensureSchema(connection: Database.Database) {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      family TEXT,
      op TEXT NOT NULL,
      batch TEXT NOT NULL,
      quantity REAL NOT NULL,
      currentStage TEXT DEFAULT 'producao_1kg',
      status TEXT DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)

  // Tabela de análises de qualidade
  connection.exec(`
    CREATE TABLE IF NOT EXISTS quality_tests (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      batch TEXT NOT NULL,
      stage TEXT NOT NULL,
      parameter TEXT NOT NULL,
      targetValue REAL NOT NULL,
      tolMin REAL NOT NULL,
      tolMax REAL NOT NULL,
      measuredValue REAL NOT NULL,
      unit TEXT NOT NULL,
      operator TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      approved INTEGER NOT NULL,
      notes TEXT
    )
  `)

  // Tabela de não conformidades (CAPA)
  connection.exec(`
    CREATE TABLE IF NOT EXISTS non_conformities (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      productName TEXT NOT NULL,
      batch TEXT NOT NULL,
      stage TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      responsible TEXT,
      deadline TEXT
    )
  `)

  // Índice de unicidade para evitar duplicidade por (op, batch)
  connection.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_op_batch ON products(op, batch);
  `)

  // Migração simples de estágios antigos -> novos
  // Verificar e adicionar coluna 'image' caso não exista
  try {
    const cols = connection.prepare(`PRAGMA table_info(products)`).all() as Array<{ name: string }>
    const hasImage = cols.some((c) => c.name === 'image')
    if (!hasImage) {
      connection.exec(`ALTER TABLE products ADD COLUMN image TEXT`)
    }
    const hasFamily = cols.some((c) => c.name === 'family')
    if (!hasFamily) {
      connection.exec(`ALTER TABLE products ADD COLUMN family TEXT`)
    }
  } catch (e) {
    // noop: se falhar, a inserção tratará e veremos nos logs
  }

  // Tabela de Semi-Acabados (itens)
  connection.exec(`
    CREATE TABLE IF NOT EXISTS semi_finished_items (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      name TEXT NOT NULL,
      family TEXT NOT NULL,
      op TEXT NOT NULL,
      batch TEXT NOT NULL,
      quantity_total REAL NOT NULL,
      quantity_envasado REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'aguardando',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)

  // Tabela de famílias (opcional)
  connection.exec(`
    CREATE TABLE IF NOT EXISTS semi_finished_families (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)

  // Índices úteis
  connection.exec(`
    CREATE INDEX IF NOT EXISTS idx_sfi_status ON semi_finished_items(status);
  `)

  // Baldes do produto na produção
  connection.exec(`
    CREATE TABLE IF NOT EXISTS product_buckets (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      bucketIndex INTEGER NOT NULL,
      capacityKg REAL NOT NULL,
      originalQuantityKg REAL NOT NULL,
      currentQuantityKg REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)
  connection.exec(`CREATE INDEX IF NOT EXISTS idx_pb_product ON product_buckets(productId);`)

  // Baldes após mover para semi‑acabados
  connection.exec(`
    CREATE TABLE IF NOT EXISTS semi_finished_buckets (
      id TEXT PRIMARY KEY,
      semiFinishedId TEXT NOT NULL,
      sourceBucketId TEXT NOT NULL,
      bucketIndex INTEGER NOT NULL,
      originalQuantityKg REAL NOT NULL,
      currentQuantityKg REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'moved_to_semi',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `)
  connection.exec(`CREATE INDEX IF NOT EXISTS idx_sfb_item ON semi_finished_buckets(semiFinishedId);`)

  // Logs de envase
  connection.exec(`
    CREATE TABLE IF NOT EXISTS packaging_logs (
      id TEXT PRIMARY KEY,
      semiFinishedId TEXT NOT NULL,
      semiFinishedBucketId TEXT,
      action TEXT NOT NULL,
      deltaKg REAL,
      previousQty REAL,
      newQty REAL,
      user TEXT,
      notes TEXT,
      timestamp TEXT NOT NULL
    )
  `)

  // Migração simples de estágios antigos -> novos
  // Mapas:
  // backlog -> producao_1kg
  // producao_5kg -> reator
  // avaliacao_final -> finalizado
  // aprovado -> finalizado
  const migrations = [
    { from: 'backlog', to: 'producao_1kg' },
    { from: 'producao_5kg', to: 'reator' },
    { from: 'avaliacao_final', to: 'finalizado' },
    { from: 'aprovado', to: 'finalizado' },
  ] as const

  for (const m of migrations) {
    const stmt = connection.prepare(
      `UPDATE products SET currentStage = ?, updatedAt = ? WHERE currentStage = ?`
    )
    stmt.run(m.to, new Date().toISOString(), m.from)
  }
}

export function getDb() {
  if (!db) {
    const databasePath = path.join(process.cwd(), 'dev.db')
    db = new Database(databasePath)
    ensureSchema(db)
  }

  return db
}
