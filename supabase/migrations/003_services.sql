-- Services catalog + deal-service junction

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON services FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE deal_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_id, service_id)
);

ALTER TABLE deal_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON deal_services FOR ALL USING (true) WITH CHECK (true);

-- Seed default services
INSERT INTO services (name, description, category) VALUES
  ('Audit SEO technique', 'Analyse complète du site : structure, vitesse, indexation, maillage', 'SEO'),
  ('Audit GEO / IA', 'Analyse de la visibilité sur les outils IA et la recherche locale', 'GEO'),
  ('Stratégie SEO mensuelle', 'Accompagnement SEO récurrent : contenus, netlinking, suivi', 'SEO'),
  ('Stratégie GEO mensuelle', 'Optimisation continue de la présence sur les outils IA', 'GEO'),
  ('Refonte de site web', 'Conception et développement d''un nouveau site vitrine', 'Design'),
  ('Bundle IA', 'Pack complet : audit + stratégie SEO/GEO + intégration IA', 'IA'),
  ('Formation SEO', 'Formation de l''équipe aux bonnes pratiques SEO', 'Formation'),
  ('Rédaction de contenus', 'Création d''articles optimisés SEO/GEO', 'Contenu');
