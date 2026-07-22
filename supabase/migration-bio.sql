-- Add bio field to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS bio text DEFAULT '' CHECK (char_length(bio) <= 200);
