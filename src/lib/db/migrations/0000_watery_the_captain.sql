DO $$ BEGIN
 CREATE TYPE "custom_field_type" AS ENUM('TEXT', 'NUMBER', 'DROPDOWN', 'DATE', 'STATUS', 'CHECKBOX', 'URL', 'EMAIL');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "product_stage" AS ENUM('BACKLOG', 'PRODUCAO_1KG', 'AVALIACAO_COR', 'PRODUCAO_5KG', 'AVALIACAO_FINAL', 'APROVADO', 'REJEITADO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "product_status" AS ENUM('ACTIVE', 'PAUSED', 'COMPLETED', 'BLOCKED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "semi_finished_status" AS ENUM('AGUARDANDO', 'ENVIASANDO', 'QUARENTENA', 'FINALIZADO');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "task_priority" AS ENUM('URGENT', 'HIGH', 'NORMAL', 'LOW');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "user_role" AS ENUM('ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_field_values" (
	"id" text PRIMARY KEY NOT NULL,
	"custom_field_id" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "custom_field_type" NOT NULL,
	"required" boolean DEFAULT false,
	"options" jsonb,
	"default_value" jsonb,
	"entity_type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hourly_controls" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"stage" "product_stage" NOT NULL,
	"operator" text NOT NULL,
	"shift" text NOT NULL,
	"target_quantity" real NOT NULL,
	"actual_quantity" real NOT NULL,
	"efficiency" integer NOT NULL,
	"status" text NOT NULL,
	"notes" text,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"user_id" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_tags" (
	"product_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_tags_product_id_tag_id_pk" PRIMARY KEY("product_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"op" text NOT NULL,
	"batch" text NOT NULL,
	"quantity" real NOT NULL,
	"current_stage" "product_stage" DEFAULT 'PRODUCAO_1KG',
	"status" "product_status" DEFAULT 'ACTIVE',
	"priority" integer DEFAULT 1,
	"due_date" timestamp,
	"notes" text,
	"image" text,
	"manufacturing_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text NOT NULL,
	"updated_by_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "semi_finished_buckets" (
	"id" text PRIMARY KEY NOT NULL,
	"semi_finished_id" text NOT NULL,
	"source_bucket_id" text NOT NULL,
	"bucket_index" integer NOT NULL,
	"original_quantity_kg" real NOT NULL,
	"current_quantity_kg" real NOT NULL,
	"status" text DEFAULT 'available',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "semi_finished_items" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"name" text NOT NULL,
	"family" text DEFAULT 'Sem Família',
	"op" text NOT NULL,
	"batch" text NOT NULL,
	"quantity_total" real NOT NULL,
	"quantity_envasado" real DEFAULT 0,
	"status" "semi_finished_status" DEFAULT 'AGUARDANDO',
	"manufacturing_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text NOT NULL,
	"updated_by_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "semi_finished_tags" (
	"semi_finished_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "semi_finished_tags_semi_finished_id_tag_id_pk" PRIMARY KEY("semi_finished_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stage_history" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"stage" "product_stage" NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"mod" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"description" text,
	"usage_count" integer DEFAULT 0,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'assignee',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_dependencies" (
	"id" text PRIMARY KEY NOT NULL,
	"dependent_id" text NOT NULL,
	"depends_on_id" text NOT NULL,
	"type" text DEFAULT 'finish_to_start',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task_tags" (
	"task_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_tags_task_id_tag_id_pk" PRIMARY KEY("task_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" "task_priority" DEFAULT 'NORMAL',
	"status" text DEFAULT 'todo',
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_by_id" text NOT NULL,
	"parent_task_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'VIEWER',
	"image" text,
	"email_verified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_logs_user_id_idx" ON "activity_logs" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_logs_entity_idx" ON "activity_logs" ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "custom_field_values_custom_field_id_idx" ON "custom_field_values" ("custom_field_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "custom_field_values_entity_idx" ON "custom_field_values" ("custom_field_id","entity_id","entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hourly_controls_product_id_idx" ON "hourly_controls" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hourly_controls_date_idx" ON "hourly_controls" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_op_batch_idx" ON "products" ("op","batch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_op_idx" ON "products" ("op");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_batch_idx" ON "products" ("batch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_current_stage_idx" ON "products" ("current_stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_created_by_id_idx" ON "products" ("created_by_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_priority_idx" ON "products" ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semi_finished_buckets_semi_finished_id_idx" ON "semi_finished_buckets" ("semi_finished_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semi_finished_items_product_id_idx" ON "semi_finished_items" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semi_finished_items_op_idx" ON "semi_finished_items" ("op");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semi_finished_items_batch_idx" ON "semi_finished_items" ("batch");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "semi_finished_items_status_idx" ON "semi_finished_items" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stage_history_product_id_idx" ON "stage_history" ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_created_by_id_idx" ON "tags" ("created_by_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "task_assignments_task_user_idx" ON "task_assignments" ("task_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_created_by_id_idx" ON "tasks" ("created_by_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_parent_task_id_idx" ON "tasks" ("parent_task_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");