-- Fix data access policies for students, library books, and library transactions

-- Students table policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for students to view their own data
CREATE POLICY "Students can view own data" ON students
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for faculty and admin to view all students
CREATE POLICY "Faculty and admin can view all students" ON students
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'faculty')
        )
    );

-- Policy for admin to insert students
CREATE POLICY "Admin can insert students" ON students
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );

-- Policy for admin to update students
CREATE POLICY "Admin can update students" ON students
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );


-- Courses table policies (needed for student creation)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policy for all authenticated users to view courses
CREATE POLICY "All authenticated users can view courses" ON courses
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Policy for admin to manage courses
CREATE POLICY "Admin can manage courses" ON courses
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role = 'admin'
        )
    );

-- Create university and department if not exists
INSERT INTO universities (id, name, code, address, contact_info, established_date, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Demo University', 'DU', 
     '{"street": "123 University Road", "city": "Mumbai", "state": "Maharashtra", "country": "India", "pincode": "400001"}',
     '{"phone": "+91-22-12345678", "email": "info@demouniversity.edu", "fax": "+91-22-12345679"}',
     '2000-01-01', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments (id, university_id, name, code, is_active) VALUES
    ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Engineering', 'ENG', true)
ON CONFLICT (id) DO NOTHING;

-- Add course data for testing
INSERT INTO courses (id, department_id, name, code, degree_type, duration_years, total_credits, min_credits_required, is_active) VALUES
    ('31111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Bachelor of Computer Science', 'CS101', 'bachelor', 4, 160, 150, true),
    ('32222222-2222-2222-2222-222222222222', '21111111-1111-1111-1111-111111111111', 'Bachelor of Electronics', 'EC101', 'bachelor', 4, 160, 150, true),
    ('33333333-3333-3333-3333-333333333333', '21111111-1111-1111-1111-111111111111', 'Bachelor of Mechanical Engineering', 'ME101', 'bachelor', 4, 160, 150, true),
    ('34444444-4444-4444-4444-444444444444', '21111111-1111-1111-1111-111111111111', 'Bachelor of Civil Engineering', 'CE101', 'bachelor', 4, 160, 150, true)
ON CONFLICT (id) DO NOTHING;