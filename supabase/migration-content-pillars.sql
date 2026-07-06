CREATE TABLE content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'individu' CHECK (audience IN ('individu', 'keluarga')),
  channels TEXT[] NOT NULL DEFAULT '{}',
  temas TEXT[] NOT NULL DEFAULT '{}',
  goals TEXT NOT NULL DEFAULT '',
  cta_style TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pillars
CREATE POLICY "Admins can manage content pillars"
  ON content_pillars
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- All authenticated users can read pillars (for use in insight/ai)
CREATE POLICY "Authenticated users can view content pillars"
  ON content_pillars
  FOR SELECT
  TO authenticated
  USING (true);
