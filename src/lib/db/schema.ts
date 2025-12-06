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
  'MOD_OPERATOR',
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
    emailVerified: timestamp('emailVerified'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
    usageCount: integer('usageCount').default(0),
    createdById: text('createdById').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
    defaultValue: jsonb('defaultValue'),
    entityType: text('entityType').notNull(), // "product" | "semiFinished"
    isActive: boolean('isActive').default(true),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  }
)

export const customFieldValues = pgTable(
  'custom_field_values',
  {
    id: text('id').primaryKey(),
    customFieldId: text('customFieldId').notNull(),
    entityId: text('entityId').notNull(),
    entityType: text('entityType').notNull(),
    value: jsonb('value').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
    dueDate: timestamp('dueDate'),
    completedAt: timestamp('completedAt'),
    createdById: text('createdById').notNull(),
    parentTaskId: text('parentTaskId'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
    taskId: text('taskId').notNull(),
    userId: text('userId').notNull(),
    role: text('role').default('assignee'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
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
    taskId: text('taskId').notNull(),
    tagId: text('tagId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.tagId] }),
  })
)

export const taskDependencies = pgTable(
  'task_dependencies',
  {
    id: text('id').primaryKey(),
    dependentId: text('dependentId').notNull(),
    dependsOnId: text('dependsOnId').notNull(),
    type: text('type').default('finish_to_start'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  }
)

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type').notNull(),
    userId: text('userId').notNull(),
    isRead: boolean('isRead').default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
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
    entityType: text('entityType').notNull(),
    entityId: text('entityId').notNull(),
    userId: text('userId').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
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
    currentStage: productStageEnum('currentStage').default('PRODUCAO_1KG'),
    status: productStatusEnum('status').default('ACTIVE'),
    priority: integer('priority').default(1),
    dueDate: timestamp('dueDate'),
    notes: text('notes'),
    image: text('image'),
    manufacturingDate: timestamp('manufacturingDate').defaultNow(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    createdById: text('createdById').notNull(),
    updatedById: text('updatedById'),
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
    productId: text('productId').notNull(),
    tagId: text('tagId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagId] }),
  })
)

export const semiFinishedItems = pgTable(
  'semi_finished_items',
  {
    id: text('id').primaryKey(),
    productId: text('productId'),
    name: text('name').notNull(),
    family: text('family').default('Sem Família'),
    op: text('op').notNull(),
    batch: text('batch').notNull(),
    quantityTotal: real('quantityTotal').notNull(),
    quantityEnvasado: real('quantityEnvasado').default(0),
    status: semiFinishedStatusEnum('status').default('AGUARDANDO'),
    manufacturingDate: timestamp('manufacturingDate').defaultNow(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    createdById: text('createdById').notNull(),
    updatedById: text('updatedById'),
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
    semiFinishedId: text('semiFinishedId').notNull(),
    tagId: text('tagId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.semiFinishedId, table.tagId] }),
  })
)

export const semiFinishedBuckets = pgTable(
  'semi_finished_buckets',
  {
    id: text('id').primaryKey(),
    semiFinishedId: text('semiFinishedId').notNull(),
    sourceBucketId: text('sourceBucketId').notNull(),
    bucketIndex: integer('bucketIndex').notNull(),
    originalQuantityKg: real('originalQuantityKg').notNull(),
    currentQuantityKg: real('currentQuantityKg').notNull(),
    status: text('status').default('available'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
    productId: text('productId').notNull(),
    stage: productStageEnum('stage').notNull(),
    startTime: timestamp('startTime').notNull(),
    endTime: timestamp('endTime'),
    mod: integer('mod').notNull(),
    notes: text('notes'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index('stage_history_product_id_idx').on(table.productId),
  })
)

export const hourlyControls = pgTable(
  'hourly_controls',
  {
    id: text('id').primaryKey(),
    productId: text('productId').notNull(),
    productName: text('productName').notNull(),
    stage: productStageEnum('stage').notNull(),
    operator: text('operator').notNull(),
    shift: text('shift').notNull(),
    targetQuantity: real('targetQuantity').notNull(),
    actualQuantity: real('actualQuantity').notNull(),
    efficiency: integer('efficiency').notNull(),
    status: text('status').notNull(),
    notes: text('notes'),
    date: timestamp('date').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
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
