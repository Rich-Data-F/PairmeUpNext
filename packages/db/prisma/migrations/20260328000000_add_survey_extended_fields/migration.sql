-- Migration: add extended survey fields
-- Adds: batteryAutonomyMinutes, style/comfort/phone/sport/resistance ratings,
--       per-item localization types, localizationUseful, currency, spareCountry,
--       sparePrice, spareCurrency

ALTER TABLE "survey_responses"
  -- Battery autonomy in minutes (slider)
  ADD COLUMN IF NOT EXISTS "batteryAutonomyMinutes" INTEGER,

  -- Style & comfort (1-5)
  ADD COLUMN IF NOT EXISTS "styleRate"               INTEGER,
  ADD COLUMN IF NOT EXISTS "comfortRate"             INTEGER,
  ADD COLUMN IF NOT EXISTS "phoneQualityMyselfRate"  INTEGER,
  ADD COLUMN IF NOT EXISTS "phoneQualityOtherRate"   INTEGER,
  ADD COLUMN IF NOT EXISTS "sportStayRate"           INTEGER,
  ADD COLUMN IF NOT EXISTS "overallResistanceRate"   INTEGER,

  -- Per-item localization types
  ADD COLUMN IF NOT EXISTS "earbudLocType"           TEXT,
  ADD COLUMN IF NOT EXISTS "caseLocType"             TEXT,

  -- Localization usefulness
  ADD COLUMN IF NOT EXISTS "localizationUseful"      BOOLEAN,

  -- Original purchase currency (separate from price)
  ADD COLUMN IF NOT EXISTS "currency"                TEXT,

  -- Spare purchase details
  ADD COLUMN IF NOT EXISTS "spareCountry"            TEXT,
  ADD COLUMN IF NOT EXISTS "sparePrice"              DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "spareCurrency"           TEXT;
