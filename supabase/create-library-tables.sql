-- Create Library Management Tables

-- Library Books Table
CREATE TABLE IF NOT EXISTS library_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL,
  publication_year INTEGER,
  publisher TEXT,
  edition TEXT,
  language TEXT DEFAULT 'English',
  tags TEXT[],
  cover_image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_copies CHECK (available_copies <= total_copies AND available_copies >= 0)
);

-- Library Transactions Table
CREATE TABLE IF NOT EXISTS library_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  fine_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('issued', 'returned', 'lost', 'damaged')) DEFAULT 'issued',
  remarks TEXT,
  issued_by UUID REFERENCES users(id),
  returned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (due_date >= issue_date AND (return_date IS NULL OR return_date >= issue_date))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_library_books_isbn ON library_books(isbn);
CREATE INDEX IF NOT EXISTS idx_library_books_category ON library_books(category);
CREATE INDEX IF NOT EXISTS idx_library_books_title ON library_books(title);
CREATE INDEX IF NOT EXISTS idx_library_transactions_student ON library_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_book ON library_transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_library_transactions_status ON library_transactions(status);
CREATE INDEX IF NOT EXISTS idx_library_transactions_due_date ON library_transactions(due_date) WHERE status = 'issued';

-- Create function to update available copies when book is issued
CREATE OR REPLACE FUNCTION update_book_availability() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'issued' THEN
    UPDATE library_books 
    SET available_copies = available_copies - 1 
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status IN ('returned', 'lost', 'damaged') THEN
    UPDATE library_books 
    SET available_copies = available_copies + 1 
    WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for book availability
DROP TRIGGER IF EXISTS trigger_update_book_availability ON library_transactions;
CREATE TRIGGER trigger_update_book_availability
  AFTER INSERT OR UPDATE ON library_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_book_availability();

-- Create function to calculate fines
CREATE OR REPLACE FUNCTION calculate_fine(due_date DATE, return_date DATE) RETURNS DECIMAL AS $$
DECLARE
  days_overdue INTEGER;
  fine_per_day DECIMAL := 10.00; -- ₹10 per day
BEGIN
  IF return_date IS NULL THEN
    days_overdue := GREATEST(0, CURRENT_DATE - due_date);
  ELSE
    days_overdue := GREATEST(0, return_date - due_date);
  END IF;
  RETURN days_overdue * fine_per_day;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-update fines
CREATE OR REPLACE FUNCTION update_library_fine() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'issued' AND NEW.return_date IS NULL THEN
    NEW.fine_amount := calculate_fine(NEW.due_date, NULL);
  ELSIF NEW.return_date IS NOT NULL THEN
    NEW.fine_amount := calculate_fine(NEW.due_date, NEW.return_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for fine calculation
DROP TRIGGER IF EXISTS trigger_update_library_fine ON library_transactions;
CREATE TRIGGER trigger_update_library_fine
  BEFORE INSERT OR UPDATE ON library_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_library_fine();

-- Add RLS policies
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "All authenticated users can view books" ON library_books;
DROP POLICY IF EXISTS "Admin and librarian can insert books" ON library_books;
DROP POLICY IF EXISTS "Admin and librarian can update books" ON library_books;
DROP POLICY IF EXISTS "Students can view own transactions" ON library_transactions;
DROP POLICY IF EXISTS "Admin and librarian can insert transactions" ON library_transactions;
DROP POLICY IF EXISTS "Admin and librarian can update transactions" ON library_transactions;

-- Library books policies
CREATE POLICY "All authenticated users can view books" ON library_books
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and librarian can insert books" ON library_books
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

CREATE POLICY "Admin and librarian can update books" ON library_books
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

CREATE POLICY "Admin and librarian can delete books" ON library_books
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

-- Library transactions policies
CREATE POLICY "Students can view own transactions" ON library_transactions
    FOR SELECT
    USING (
        student_id = auth.uid() OR
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

CREATE POLICY "Admin and librarian can insert transactions" ON library_transactions
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

CREATE POLICY "Admin and librarian can update transactions" ON library_transactions
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

CREATE POLICY "Admin and librarian can delete transactions" ON library_transactions
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );