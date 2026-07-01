-- review_likes table
CREATE TABLE IF NOT EXISTS review_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, review_id)
);

ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read review_likes"
    ON review_likes FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Members can insert own likes"
    ON review_likes FOR INSERT
    WITH CHECK (member_id = auth.uid()::uuid);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Members can delete own likes"
    ON review_likes FOR DELETE
    USING (member_id = auth.uid()::uuid);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
