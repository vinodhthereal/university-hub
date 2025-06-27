-- University Hub Quick Setup SQL Script
-- Run this in Supabase SQL Editor to set up all tables at once

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic tables first (without foreign key dependencies)

-- 1. Universities table (for multi-tenant support)
CREATE TABLE IF NOT EXISTS universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address JSONB NOT NULL DEFAULT '{}',
  contact_info JSONB NOT NULL DEFAULT '{}',
  logo_url TEXT,
  website TEXT,
  established_date DATE,
  accreditation JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create a default university
INSERT INTO universities (name, code, address, contact_info)
VALUES (
  'Demo University',
  'DEMO001',
  '{"street": "123 Education St", "city": "Demo City", "state": "Demo State", "zip": "12345"}',
  '{"phone": "+91-1234567890", "email": "info@demouniversity.edu"}'
) ON CONFLICT (code) DO NOTHING;

-- 3. Departments table (without head_id reference first)
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head_id UUID, -- Will add foreign key later
  description TEXT,
  established_date DATE,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id, code)
);

-- 4. Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'faculty', 'student', 'parent', 'staff')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  phone TEXT,
  alternate_phone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  nationality TEXT DEFAULT 'Indian',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now add the foreign key for department head
ALTER TABLE departments 
  ADD CONSTRAINT fk_department_head 
  FOREIGN KEY (head_id) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- 5. Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  degree_type TEXT CHECK (degree_type IN ('bachelor', 'master', 'diploma', 'certificate', 'phd')),
  duration_years DECIMAL(2,1) NOT NULL,
  total_credits INTEGER NOT NULL,
  min_credits_required INTEGER NOT NULL,
  max_intake INTEGER,
  eligibility_criteria JSONB,
  syllabus_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, code)
);

-- 6. Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  course_id UUID REFERENCES courses(id),
  batch_year INTEGER NOT NULL,
  semester INTEGER DEFAULT 1,
  section TEXT,
  roll_number TEXT,
  admission_date DATE NOT NULL,
  admission_type TEXT CHECK (admission_type IN ('regular', 'lateral', 'transfer')),
  admission_category TEXT,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guardian_info JSONB,
  permanent_address JSONB NOT NULL,
  current_address JSONB,
  blood_group TEXT,
  medical_info JSONB,
  emergency_contacts JSONB NOT NULL,
  previous_education JSONB,
  documents JSONB,
  is_hosteller BOOLEAN DEFAULT false,
  transport_opted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  designation TEXT NOT NULL,
  qualification JSONB NOT NULL,
  specialization TEXT[],
  experience_years DECIMAL(3,1),
  join_date DATE NOT NULL,
  teaching_subjects UUID[],
  research_interests TEXT[],
  publications JSONB,
  office_location TEXT,
  consultation_hours JSONB,
  is_permanent BOOLEAN DEFAULT true,
  salary_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create sample departments
INSERT INTO departments (university_id, name, code)
SELECT 
  (SELECT id FROM universities WHERE code = 'DEMO001'),
  dept.name,
  dept.code
FROM (VALUES 
  ('Computer Science', 'CS'),
  ('Electronics', 'EC'),
  ('Mechanical', 'ME'),
  ('Civil', 'CE')
) AS dept(name, code)
ON CONFLICT DO NOTHING;

-- 9. Create sample courses
INSERT INTO courses (department_id, name, code, degree_type, duration_years, total_credits, min_credits_required)
SELECT 
  d.id,
  c.name,
  c.code,
  c.degree_type,
  c.duration_years,
  c.total_credits,
  c.min_credits_required
FROM departments d
CROSS JOIN (VALUES 
  ('Bachelor of Technology - Computer Science', 'BTCS', 'bachelor', 4, 180, 170),
  ('Master of Technology - Computer Science', 'MTCS', 'master', 2, 90, 85)
) AS c(name, code, degree_type, duration_years, total_credits, min_credits_required)
WHERE d.code = 'CS'
ON CONFLICT DO NOTHING;

-- 10. Enable Row Level Security on all tables
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- 11. Create basic RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 12. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Apply updated_at triggers
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 14. Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_students_batch ON students(batch_year);
CREATE INDEX idx_faculty_department ON faculty(id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'University Hub database setup completed successfully!';
END $$;