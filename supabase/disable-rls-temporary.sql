-- TEMPORARY FIX - Disable RLS for Development
-- WARNING: Only use this for development. Re-enable RLS with proper policies for production!

-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE faculty DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later, use:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;