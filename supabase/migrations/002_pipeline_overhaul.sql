-- RE7SET CRM Pipeline Overhaul Migration
-- New enums, stages, team management, onboarding, notifications

BEGIN;

-- ============================================================
-- 1. NEW ENUMS
-- ============================================================

CREATE TYPE profession AS ENUM (
  'avocat',
  'notaire',
  'commissaire_de_justice',
  'expert_comptable'
);

CREATE TYPE offer_type AS ENUM (
  'audit_one_shot',
  'recurrent_seo_geo',
  'bundle_ia'
);

CREATE TYPE deal_source AS ENUM (
  'cold_email',
  'linkedin',
  'referral',
  'other'
);

CREATE TYPE team_role AS ENUM (
  'prospection',
  'audit',
  'closing',
  'visio',
  'admin'
);

CREATE TYPE warm_status AS ENUM (
  'none',
  'opened',
  'clicked',
  'replied'
);

-- ============================================================
-- 2. REPLACE DEAL STAGES
-- ============================================================

CREATE TYPE deal_stage_new AS ENUM (
  'Réponse positive',
  'Audit en cours',
  'Visio/Closing',
  'Signé',
  'Perdu'
);

ALTER TABLE deals ADD COLUMN stage_new deal_stage_new;

UPDATE deals SET stage_new = CASE
  WHEN stage IN ('Prospect', 'Qualification') THEN 'Réponse positive'::deal_stage_new
  WHEN stage = 'Proposition' THEN 'Audit en cours'::deal_stage_new
  WHEN stage = 'Négociation' THEN 'Visio/Closing'::deal_stage_new
  WHEN stage = 'Gagné' THEN 'Signé'::deal_stage_new
  WHEN stage = 'Perdu' THEN 'Perdu'::deal_stage_new
END;

ALTER TABLE deals DROP COLUMN stage;
ALTER TABLE deals RENAME COLUMN stage_new TO stage;
ALTER TABLE deals ALTER COLUMN stage SET DEFAULT 'Réponse positive'::deal_stage_new;
ALTER TABLE deals ALTER COLUMN stage SET NOT NULL;

DROP TYPE deal_stage;
ALTER TYPE deal_stage_new RENAME TO deal_stage;

-- Update pipeline_stages
DELETE FROM pipeline_stages;
INSERT INTO pipeline_stages (name, position, color) VALUES
  ('Réponse positive', 0, '210 78% 46%'),
  ('Audit en cours', 1, '264 60% 55%'),
  ('Visio/Closing', 2, '38 92% 50%'),
  ('Signé', 3, '145 63% 42%'),
  ('Perdu', 4, '0 72% 51%');

-- ============================================================
-- 3. TEAM MEMBERS TABLE (must exist before deals FK)
-- ============================================================

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  role team_role NOT NULL DEFAULT 'prospection',
  avatar_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO team_members (name, role) VALUES
  ('Brandon', 'prospection'),
  ('Achille', 'audit'),
  ('Sibyle', 'closing'),
  ('Stan', 'visio');

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON team_members FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. NEW COLUMNS ON DEALS
-- ============================================================

ALTER TABLE deals
  ADD COLUMN profession profession,
  ADD COLUMN barreau_ordre TEXT DEFAULT '',
  ADD COLUMN offer_type offer_type,
  ADD COLUMN mrr NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN mrr_cible NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN sibyle_validation BOOLEAN DEFAULT false,
  ADD COLUMN audit_report_url TEXT DEFAULT '',
  ADD COLUMN source deal_source DEFAULT 'other',
  ADD COLUMN warm_status warm_status DEFAULT 'none',
  ADD COLUMN assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  ADD COLUMN lemlist_campaign_id TEXT DEFAULT '',
  ADD COLUMN onboarding_started_at TIMESTAMPTZ;

-- ============================================================
-- 5. ASSIGNMENT RULES
-- ============================================================

CREATE TABLE assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage deal_stage NOT NULL,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stage, team_member_id)
);

ALTER TABLE assignment_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON assignment_rules FOR ALL USING (true) WITH CHECK (true);

-- Seed default assignment rules
INSERT INTO assignment_rules (stage, team_member_id)
SELECT 'Réponse positive'::deal_stage, id FROM team_members WHERE name = 'Brandon';
INSERT INTO assignment_rules (stage, team_member_id)
SELECT 'Audit en cours'::deal_stage, id FROM team_members WHERE name = 'Achille';
INSERT INTO assignment_rules (stage, team_member_id)
SELECT 'Audit en cours'::deal_stage, id FROM team_members WHERE name = 'Sibyle';
INSERT INTO assignment_rules (stage, team_member_id)
SELECT 'Visio/Closing'::deal_stage, id FROM team_members WHERE name = 'Stan';

-- ============================================================
-- 6. ONBOARDING TABLES
-- ============================================================

CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  day_offset INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON onboarding_templates FOR ALL USING (true) WITH CHECK (true);

INSERT INTO onboarding_templates (title, day_offset, position) VALUES
  ('Kick-off call planifié', 0, 0),
  ('Accès Google Analytics / Search Console', 0, 1),
  ('Accès CMS / back-office site', 1, 2),
  ('Audit technique SEO lancé', 2, 3),
  ('Audit GEO / IA lancé', 2, 4),
  ('Livraison rapport audit', 7, 5),
  ('Présentation résultats client', 10, 6),
  ('Plan d''action validé', 14, 7),
  ('Premières optimisations déployées', 21, 8),
  ('Point de suivi J+30', 30, 9);

CREATE TABLE deal_onboarding_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  template_id UUID REFERENCES onboarding_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  day_offset INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deal_onboarding_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON deal_onboarding_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 8. NEW ACTIVITY TYPES
-- ============================================================

ALTER TYPE activity_type ADD VALUE 'lemlist_email';
ALTER TYPE activity_type ADD VALUE 'stan_call';
ALTER TYPE activity_type ADD VALUE 'lemlist_open';
ALTER TYPE activity_type ADD VALUE 'lemlist_click';

COMMIT;
