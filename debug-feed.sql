-- 1. Check your reading logs
SELECT rl.id, rl.created_at, rl.pages_read, rl.member_id, rl.shelf_item_id,
       si.id as si_id, si.member_id as si_member_id, si.book_id,
       b.id as book_id2, b.title, b.slug
FROM reading_logs rl
LEFT JOIN shelf_items si ON si.id = rl.shelf_item_id
LEFT JOIN books b ON b.id = si.book_id
WHERE rl.member_id IN (
  SELECT id FROM members WHERE auth_user_id = auth.uid()
)
ORDER BY rl.created_at DESC
LIMIT 20;

-- 2. Check RLS: does reading_logs have member_id matching?
SELECT id, member_id, shelf_item_id, created_at
FROM reading_logs
WHERE member_id IN (
  SELECT id FROM members WHERE auth_user_id = auth.uid()
)
LIMIT 10;

-- 3. Verify FK: does the shelf_item_id actually exist in shelf_items?
SELECT rl.id as log_id, rl.shelf_item_id, si.id as shelf_exists
FROM reading_logs rl
LEFT JOIN shelf_items si ON si.id = rl.shelf_item_id
WHERE rl.member_id IN (
  SELECT id FROM members WHERE auth_user_id = auth.uid()
)
LIMIT 10;

-- 4. Simulate exactly what the new feed API query does
SELECT rl.id, rl.created_at, rl.pages_read, rl.member_id,
       row_to_json(si.*) as shelf,
       row_to_json(b.*) as book
FROM reading_logs rl
INNER JOIN shelf_items si ON si.id = rl.shelf_item_id
INNER JOIN books b ON b.id = si.book_id
WHERE rl.member_id IN (
  SELECT id FROM members WHERE auth_user_id = auth.uid()
)
ORDER BY rl.created_at DESC
LIMIT 20;

-- 5. Check if your member ID is in the members table
SELECT id, name, auth_user_id IS NOT NULL as has_auth
FROM members
WHERE id IN (
  SELECT member_id FROM reading_logs
  ORDER BY created_at DESC
  LIMIT 5
);
