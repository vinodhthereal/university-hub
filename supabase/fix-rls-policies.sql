-- Fix RLS Policies for User Registration
-- Run this in Supabase SQL Editor to fix the registration issue

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new comprehensive policies

-- 1. Allow users to insert their own profile during registration
CREATE POLICY "Enable insert for authentication users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Allow users to view their own profile
CREATE POLICY "Enable select for users based on user_id" ON users
  FOR SELECT USING (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Allow admins to view all users
CREATE POLICY "Enable select for admins" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 5. Allow admins to update all users
CREATE POLICY "Enable update for admins" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- 6. Allow admins to delete users
CREATE POLICY "Enable delete for admins" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Also ensure the auth schema policies are correct
-- This allows the auth system to read user data
CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- For other tables that might need similar fixes:

-- Students table policies
DROP POLICY IF EXISTS "Students can view their own data" ON students;

CREATE POLICY "Enable insert for students during registration" ON students
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can view their own data" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own data" ON students
  FOR UPDATE USING (auth.uid() = id);

-- Faculty table policies
DROP POLICY IF EXISTS "Faculty can view their own data" ON faculty;

CREATE POLICY "Enable insert for faculty during registration" ON faculty
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Faculty can view their own data" ON faculty
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Faculty can update their own data" ON faculty
  FOR UPDATE USING (auth.uid() = id);

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('users', 'students', 'faculty')
ORDER BY tablename, policyname;