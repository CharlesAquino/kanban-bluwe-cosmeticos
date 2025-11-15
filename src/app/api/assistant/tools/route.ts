import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { KANBAN_KNOWLEDGE_BASE } from '@/lib/knowledge-base'

const db = getDb()

// Ferramentas SEGURAS - apenas consulta metadados e dados públicos
export async function POST(request: NextRequest) {
  try {
    const { tool, params } = await request.json()

    console.log('[Assistant Tools] Chamada segura:', tool, params)

    switch (tool) {
      case 'get_system_knowledge':
        return NextResponse.json(getSystemKnowledge(params?.topic))
      case 'get_current_data':
        return NextResponse.json(await getCurrentData())
      case 'get_entity_info':
        return NextResponse.json(getEntityInfo(params?.entity))
      case 'search_features':
        return NextResponse.json(searchFeatures(params?.query))
      default:
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('[Assistant Tools] Error:', error)
    return NextResponse.json({ error: 'Tool execution failed' }, { status: 500 })
  }
}

function getSystemKnowledge(topic?: string) {
  if (!topic) {
    return {
      tool: 'get_system_knowledge',
      knowledge: KANBAN_KNOWLEDGE_BASE
    }
  }

  // Busca por tópico específico
  const topics = topic.toLowerCase()
  const result: any = {}

  if (topics.includes('system') || topics.includes('sistema')) {
    result.system = KANBAN_KNOWLEDGE_BASE.system
  }

  if (topics.includes('product') || topics.includes('produto')) {
    result.products = KANBAN_KNOWLEDGE_BASE.entities.products
  }

  if (topics.includes('bucket') || topics.includes('balde')) {
    result.buckets = KANBAN_KNOWLEDGE_BASE.entities.product_buckets
    result.semi_buckets = KANBAN_KNOWLEDGE_BASE.entities.semi_finished_buckets
  }

  if (topics.includes('semi') || topics.includes('acabado')) {
    result.semi_finished = KANBAN_KNOWLEDGE_BASE.entities.semi_finished_items
  }

  if (topics.includes('workflow') || topics.includes('fluxo')) {
    result.workflows = KANBAN_KNOWLEDGE_BASE.workflows
  }

  if (topics.includes('feature') || topics.includes('funcionalidade')) {
    result.features = KANBAN_KNOWLEDGE_BASE.features
  }

  if (topics.includes('ui') || topics.includes('interface')) {
    result.ui = KANBAN_KNOWLEDGE_BASE.ui_components
  }

  return {
    tool: 'get_system_knowledge',
    topic,
    knowledge: result
  }
}

function getEntityInfo(entity?: string) {
  if (!entity) {
    return {
      tool: 'get_entity_info',
      entities: Object.keys(KANBAN_KNOWLEDGE_BASE.entities)
    }
  }

  const entityKey = entity.toLowerCase()
  const entities = KANBAN_KNOWLEDGE_BASE.entities

  for (const [key, info] of Object.entries(entities)) {
    if (key.toLowerCase().includes(entityKey) || entityKey.includes(key.toLowerCase())) {
      return {
        tool: 'get_entity_info',
        entity: key,
        info
      }
    }
  }

  return {
    tool: 'get_entity_info',
    entity,
    info: null,
    available: Object.keys(entities)
  }
}

function searchFeatures(query?: string) {
  if (!query) {
    return {
      tool: 'search_features',
      features: KANBAN_KNOWLEDGE_BASE.features
    }
  }

  const q = query.toLowerCase()
  const results = KANBAN_KNOWLEDGE_BASE.features.filter(feature =>
    feature.toLowerCase().includes(q)
  )

  return {
    tool: 'search_features',
    query,
    results
  }
}

async function getCurrentData() {
  try {
    console.log('[Tools API] Executando get_current_data')
    // Busca dados atuais PUBLICOS - sem informações sensíveis
    const products = db.prepare('SELECT COUNT(*) as total FROM products').get()
    console.log('[Tools API] Produtos encontrados:', products.total)
    const semiFinished = db.prepare('SELECT COUNT(*) as total FROM semi_finished_items').get()
    const buckets = db.prepare('SELECT status, COUNT(*) as count FROM product_buckets GROUP BY status').all()
    const semiBuckets = db.prepare('SELECT status, COUNT(*) as count FROM semi_finished_buckets GROUP BY status').all()

    // Estatísticas agregadas (sem dados individuais)
    const families = db.prepare('SELECT family, COUNT(*) as count FROM products GROUP BY family').all()

    return {
      tool: 'get_current_data',
      summary: {
        total_products: products.total,
        total_semi_finished: semiFinished.total,
        product_buckets_by_status: buckets,
        semi_finished_buckets_by_status: semiBuckets,
        products_by_family: families
      },
      last_updated: new Date().toISOString()
    }
  } catch (error) {
    return {
      tool: 'get_current_data',
      error: 'Database query failed',
      summary: {
        total_products: 0,
        total_semi_finished: 0
      }
    }
  }
}
