export type Member = {
  id: string;
  family_id: string;
  name: string;
  avatar: string;
  role: "admin" | "member";
  is_cms_admin: boolean;
  created_at: string;
  weekly_pages_goal: number;
};

export type Family = {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
};

export type Session = {
  familyId: string;
  familyName: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberRole: "admin" | "member";
};

export type Book = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  description: string | null;
  categories: string[];
  tags: string[];
  publisher: string | null;
  published_year: number | null;
  language: string;
  is_active: boolean;
};

export type ShelfItem = {
  id: string;
  member_id: string;
  family_id: string;
  book_id: string;
  status: "want" | "reading" | "done";
  current_page: number;
  started_at: string | null;
  finished_at: string | null;
  books?: Book;
};

export type ReadingLog = {
  id: string;
  shelf_item_id: string;
  member_id: string;
  log_date: string;
  pages_read: number;
  duration_minutes: number | null;
  note: string | null;
};

export type Streak = {
  member_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
};
