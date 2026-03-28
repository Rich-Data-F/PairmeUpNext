-- Migration: add survey resale tracking fields
-- Adds: resoldItem, resoldItemType, resoldCondition, resoldPrice, resoldCurrency, resoldStore

ALTER TABLE "survey_responses"
  ADD COLUMN IF NOT EXISTS "resoldItem"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "resoldItemType"  TEXT,
  ADD COLUMN IF NOT EXISTS "resoldCondition" TEXT,
  ADD COLUMN IF NOT EXISTS "resoldPrice"     DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "resoldCurrency"  TEXT,
  ADD COLUMN IF NOT EXISTS "resoldStore"     TEXT;
