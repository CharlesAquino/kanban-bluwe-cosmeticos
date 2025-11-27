-- Migration: Create quality_tests and non_conformities tables
-- Created: 2025-11-27

-- Tabela de testes de qualidade
CREATE TABLE IF NOT EXISTS quality_tests (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  batch VARCHAR(255) NOT NULL,
  stage VARCHAR(100) NOT NULL,
  parameter VARCHAR(100) NOT NULL,
  target_value DECIMAL(10, 2) NOT NULL,
  tol_min DECIMAL(10, 2) NOT NULL,
  tol_max DECIMAL(10, 2) NOT NULL,
  measured_value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  operator VARCHAR(255) NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_id (product_id),
  INDEX idx_batch (batch),
  INDEX idx_approved (approved),
  INDEX idx_created_at (created_at)
);

-- Tabela de não-conformidades
CREATE TABLE IF NOT EXISTS non_conformities (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  batch VARCHAR(255) NOT NULL,
  stage VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  responsible VARCHAR(255),
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_id (product_id),
  INDEX idx_batch (batch),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at)
);

-- Tabela de eventos de auditoria
CREATE TABLE IF NOT EXISTS audit_events (
  id VARCHAR(255) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Tabela de estatísticas de monitoramento
CREATE TABLE IF NOT EXISTS monitoring_stats (
  id VARCHAR(255) PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15, 2) NOT NULL,
  unit VARCHAR(50),
  category VARCHAR(100),
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_metric_name (metric_name),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
);
