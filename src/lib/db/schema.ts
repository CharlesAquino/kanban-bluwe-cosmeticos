/**
 * Schema Drizzle ORM para Kanban Bluwe Cosméticos
 * Migrado de Prisma para Drizzle com melhor performance
 */

import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  varchar,
  real,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============ ENUMS ============

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'MANAGER',
  'OPERATOR',
  'VIEWER',
])

export const productStatusEnum = pgEnum('product_status', [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'BLOCKED',
  'CANCELLED',
])

export const productStageEnum = pgEnum('product_stage', [
  'BACKLOG',
  'PRODUCAO_1KG',
  'AVALIACAO_COR',
  'PRODUCAO_5KG',
  'AVALIACAO_FINAL',
  'APROVADO',
  'REJEITADO',
])

export const taskPriorityEnum = pgEnum('task_priority', [
  'URGENT',
  'HIGH',
  'NORMAL',
  'LOW',
])

export const customFieldTypeEnum = pgEnum('custom_field_type', [
  'TEXT',
  'NUMBER',
  'DROPDOWN',
  'DATE',
  'STATUS',
  'CHECKBOX',
  'URL',
  'EMAIL',
])

export const semiFinishedStatusEnum = pgEnum('semi_finished_status', [
  'AGUARDANDO',
  'ENVIASANDO',
  'QUARENTENA',
  'FINALIZADO',
])

// ============ TABLES ============

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    name: text('name'),
    password: text('password').notNull(),
    role: userRoleEnum('role').default('VIEWER'),
    image: text('image'),
    emailVerified: timestamp('email_verified'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
)

export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').unique().notNull(),
    color: text('color').default('#3B82F6'),
    description: text('description'),
    usageCount: integer('usage_count').default(0),
    createdById: text('created_by_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    createdByIdx: index('tags_created_by_id_idx').on(table.createdById),
  })
)

export const customFields = pgTable(
  'custom_fields',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: customFieldTypeEnum('type').notNull(),
    required: boolean('required').default(false),
    options: jsonb('options'),
    defaultValue: jsonb('default_value'),
    entityType: text('entity_type').notNull(), // "product" | "semiFinished"
    isActive: boolean('is_active').default(true),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
)

export const customFieldValues = pgTable(
  'custom_field_values',
  {
    id: text('id').primaryKey(),
    customFieldId: text('custom_field_id').notNull(),
    entityId: text('entity_id').notNull(),
    entityType: text('entity_type').notNull(),
    value: jsonb('value').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    customFieldIdx: index('custom_field_values_custom_field_id_idx').on(
      table.customFieldId
    ),
    entityIdx: uniqueIndex('custom_field_values_entity_idx').on(
      table.customFieldId,
      table.entityId,
      table.entityType
    ),
  })
)

export const tasks = pgTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    priority: taskPriorityEnum('priority').default('NORMAL'),
    status: text('status').default('todo'),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    createdById: text('created_by_id').notNull(),
    parentTaskId: text('parent_task_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    createdByIdx: index('tasks_created_by_id_idx').on(table.createdById),
    parentTaskIdx: index('tasks_parent_task_id_idx').on(table.parentTaskId),
  })
)

export const taskAssignments = pgTable(
  'task_assignments',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id').notNull(),
    userId: text('user_id').notNull(),
    role: text('role').default('assignee'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    taskUserIdx: uniqueIndex('task_assignments_task_user_idx').on(
      table.taskId,
      table.userId
    ),
  })
)

export const taskTags = pgTable(
  'task_tags',
  {
    taskId: text('task_id').notNull(),
    tagId: text('tag_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.tagId] }),
  })
)

export const taskDependencies = pgTable(
  'task_dependencies',
  {
    id: text('id').primaryKey(),
    dependentId: text('dependent_id').notNull(),
    dependsOnId: text('depends_on_id').notNull(),
    type: text('type').default('finish_to_start'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }
)

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull(),
    userId: text('user_id').notNull(),
    isRead: boolean('is_read').default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('notifications_user_id_idx').on(table.userId),
  })
)

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: text('id').primaryKey(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    userId: text('user_id').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('activity_logs_user_id_idx').on(table.userId),
    entityIdx: index('activity_logs_entity_idx').on(
      table.entityType,
      table.entityId
    ),
  })
)

export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    op: text('op').notNull(),
    batch: text('batch').notNull(),
    quantity: real('quantity').notNull(),
    currentStage: productStageEnum('current_stage').default('PRODUCAO_1KG'),
    status: productStatusEnum('status').default('ACTIVE'),
    priority: integer('priority').default(1),
    dueDate: timestamp('due_date'),
    notes: text('notes'),
    image: text('image'),
    manufacturingDate: timestamp('manufacturing_date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id').notNull(),
    updatedById: text('updated_by_id'),
  },
  (table) => ({
    opBatchIdx: uniqueIndex('products_op_batch_idx').on(table.op, table.batch),
    opIdx: index('products_op_idx').on(table.op),
    batchIdx: index('products_batch_idx').on(table.batch),
    stageIdx: index('products_current_stage_idx').on(table.currentStage),
    statusIdx: index('products_status_idx').on(table.status),
    createdByIdx: index('products_created_by_id_idx').on(table.createdById),
    priorityIdx: index('products_priority_idx').on(table.priority),
  })
)

export const productTags = pgTable(
  'product_tags',
  {
    productId: text('product_id').notNull(),
    tagId: text('tag_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
  })
)

export const semiFinishedItems = pgTable(
  'semi_finished_items',
  {
    id: text('id').primaryKey(),
    productId: text('product_id'),
    name: text('name').notNull(),
    family: text('family').default('Sem Família'),
    op: text('op').notNull(),
    batch: text('batch').notNull(),
    quantityTotal: real('quantity_total').notNull(),
    quantityEnvasado: real('quantity_envasado').default(0),
    status: semiFinishedStatusEnum('status').default('AGUARDANDO'),
    manufacturingDate: timestamp('manufacturing_date').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('created_by_id').notNull(),
    updatedById: text('updated_by_id'),
  },
  (table) => ({
    productIdx: index('semi_finished_items_product_id_idx').on(table.productId),
    opIdx: index('semi_finished_items_op_idx').on(table.op),
    batchIdx: index('semi_finished_items_batch_idx').on(table.batch),
    statusIdx: index('semi_finished_items_status_idx').on(table.status),
  })
)

export const semiFinishedTags = pgTable(
  'semi_finished_tags',
  {
    semiFinishedId: text('semi_finished_id').notNull(),
    tagId: text('tag_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.semiFinishedId, table.tagId] }),
  })
)

export const semiFinishedBuckets = pgTable(
  'semi_finished_buckets',
  {
    id: text('id').primaryKey(),
    semiFinishedId: text('semi_finished_id').notNull(),
    sourceBucketId: text('source_bucket_id').notNull(),
    bucketIndex: integer('bucket_index').notNull(),
    originalQuantityKg: real('original_quantity_kg').notNull(),
    currentQuantityKg: real('current_quantity_kg').notNull(),
    status: text('status').default('available'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    semiFinishedIdx: index('semi_finished_buckets_semi_finished_id_idx').on(
      table.semiFinishedId
    ),
  })
)

export const stageHistory = pgTable(
  'stage_history',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull(),
    stage: productStageEnum('stage').notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    mod: integer('mod').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index('stage_history_product_id_idx').on(table.productId),
  })
)

export const hourlyControls = pgTable(
  'hourly_controls',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull(),
    productName: text('product_name').notNull(),
    stage: productStageEnum('stage').notNull(),
    operator: text('operator').notNull(),
    shift: text('shift').notNull(),
    targetQuantity: real('target_quantity').notNull(),
    actualQuantity: real('actual_quantity').notNull(),
    efficiency: integer('efficiency').notNull(),
    status: text('status').notNull(),
    notes: text('notes'),
    date: timestamp('date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index('hourly_controls_product_id_idx').on(table.productId),
    dateIdx: index('hourly_controls_date_idx').on(table.date),
  })
)

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  createdProducts: many(products, { relationName: 'createdProducts' }),
  updatedProducts: many(products, { relationName: 'updatedProducts' }),
  createdTags: many(tags),
  assignedTasks: many(taskAssignments),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
}))

export const tagsRelations = relations(tags, ({ one, many }) => ({
  creator: one(users, {
    fields: [tags.createdById],
    references: [users.id],
  }),
  productTags: many(productTags),
  semiFinishedTags: many(semiFinishedTags),
  taskTags: many(taskTags),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  creator: one(users, {
    fields: [products.createdById],
    references: [users.id],
    relationName: 'createdProducts',
  }),
  updater: one(users, {
    fields: [products.updatedById],
    references: [users.id],
    relationName: 'updatedProducts',
  }),
  productTags: many(productTags),
  semiFinishedItems: many(semiFinishedItems),
  stageHistory: many(stageHistory),
  hourlyControls: many(hourlyControls),
}))

export const semiFinishedItemsRelations = relations(
  semiFinishedItems,
  ({ one, many }) => ({
    product: one(products, {
      fields: [semiFinishedItems.productId],
      references: [products.id],
    }),
    creator: one(users, {
      fields: [semiFinishedItems.createdById],
      references: [users.id],
    }),
    updater: one(users, {
      fields: [semiFinishedItems.updatedById],
      references: [users.id],
    }),
    semiFinishedTags: many(semiFinishedTags),
    buckets: many(semiFinishedBuckets),
  })
)

export const semiFinishedBucketsRelations = relations(
  semiFinishedBuckets,
  ({ one }) => ({
    semiFinishedItem: one(semiFinishedItems, {
      fields: [semiFinishedBuckets.semiFinishedId],
      references: [semiFinishedItems.id],
    }),
  })
)

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  creator: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: 'subtasks',
  }),
  subtasks: many(tasks, { relationName: 'subtasks' }),
  assignees: many(taskAssignments),
  taskTags: many(taskTags),
}))

export const stageHistoryRelations = relations(stageHistory, ({ one }) => ({
  product: one(products, {
    fields: [stageHistory.productId],
    references: [products.id],
  }),
}))

export const hourlyControlsRelations = relations(hourlyControls, ({ one }) => ({
  product: one(products, {
    fields: [hourlyControls.productId],
    references: [products.id],
  }),
}))
