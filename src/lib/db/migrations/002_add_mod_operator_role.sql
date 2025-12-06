-- Migration: Adicionar MOD_OPERATOR ao enum user_role
-- Data: 06/12/2025

-- Adicionar novo valor ao enum user_role
ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'MOD_OPERATOR';
