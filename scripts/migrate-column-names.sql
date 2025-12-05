-- ============================================
-- Migration: Renomear colunas camelCase → snake_case
-- Preserva todos os dados existentes
-- ============================================

-- USERS
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";

-- PRODUCTS
ALTER TABLE "products" RENAME COLUMN "currentStage" TO "current_stage";
ALTER TABLE "products" RENAME COLUMN "dueDate" TO "due_date";
ALTER TABLE "products" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "products" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "products" RENAME COLUMN "createdById" TO "created_by_id";
ALTER TABLE "products" RENAME COLUMN "updatedById" TO "updated_by_id";
ALTER TABLE "products" RENAME COLUMN "manufacturingDate" TO "manufacturing_date";

-- SEMI_FINISHED_ITEMS
ALTER TABLE "semi_finished_items" RENAME COLUMN "productId" TO "product_id";
ALTER TABLE "semi_finished_items" RENAME COLUMN "quantityTotal" TO "quantity_total";
ALTER TABLE "semi_finished_items" RENAME COLUMN "quantityEnvasado" TO "quantity_envasado";
ALTER TABLE "semi_finished_items" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "semi_finished_items" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "semi_finished_items" RENAME COLUMN "manufacturingDate" TO "manufacturing_date";
ALTER TABLE "semi_finished_items" RENAME COLUMN "createdById" TO "created_by_id";
ALTER TABLE "semi_finished_items" RENAME COLUMN "updatedById" TO "updated_by_id";

-- SEMI_FINISHED_BUCKETS
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "semiFinishedId" TO "semi_finished_id";
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "sourceBucketId" TO "source_bucket_id";
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "bucketIndex" TO "bucket_index";
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "originalQuantityKg" TO "original_quantity_kg";
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "currentQuantityKg" TO "current_quantity_kg";
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "semi_finished_buckets" RENAME COLUMN "updatedAt" TO "updated_at";

-- ============================================
-- Fim da migration
-- ============================================
