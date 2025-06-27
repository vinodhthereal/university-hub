-- Seed dummy data for University Hub
-- 
-- IMPORTANT: Run these scripts in order:
-- 1. create-library-tables.sql (creates library_books and library_transactions tables)
-- 2. create-simplified-schema.sql (creates simplified versions of complex tables)
-- 3. fix-data-access-policies.sql (sets up RLS policies)
-- 4. seed-dummy-data.sql (this file - adds dummy data)

-- First, create a university
INSERT INTO universities (id, name, code, address, contact_info, established_date, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Demo University', 'DU', 
     '{"street": "123 University Road", "city": "Mumbai", "state": "Maharashtra", "country": "India", "pincode": "400001"}',
     '{"phone": "+91-22-12345678", "email": "info@demouniversity.edu", "fax": "+91-22-12345679"}',
     '2000-01-01', true)
ON CONFLICT (id) DO NOTHING;

-- Create departments
INSERT INTO departments (id, university_id, name, code, is_active) VALUES
    ('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Engineering', 'ENG', true)
ON CONFLICT (id) DO NOTHING;

-- Create courses
INSERT INTO courses (id, department_id, name, code, degree_type, duration_years, total_credits, min_credits_required, is_active) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Bachelor of Computer Science', 'CS101', 'bachelor', 4, 160, 150, true),
    ('c2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Bachelor of Electronics', 'EC101', 'bachelor', 4, 160, 150, true),
    ('c3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'Bachelor of Mechanical Engineering', 'ME101', 'bachelor', 4, 160, 150, true),
    ('c4444444-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'Bachelor of Civil Engineering', 'CE101', 'bachelor', 4, 160, 150, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code;

-- Create dummy users (students)
-- Note: These are dummy entries - in production, users should be created through auth.signUp()
INSERT INTO users (id, email, full_name, role, phone, is_active) VALUES
    ('s1111111-1111-1111-1111-111111111111', 'john.doe@university.edu', 'John Doe', 'student', '9876543210', true),
    ('s2222222-2222-2222-2222-222222222222', 'jane.smith@university.edu', 'Jane Smith', 'student', '9876543211', true),
    ('s3333333-3333-3333-3333-333333333333', 'mike.johnson@university.edu', 'Mike Johnson', 'student', '9876543212', true),
    ('s4444444-4444-4444-4444-444444444444', 'sarah.williams@university.edu', 'Sarah Williams', 'student', '9876543213', true),
    ('s5555555-5555-5555-5555-555555555555', 'david.brown@university.edu', 'David Brown', 'student', '9876543214', true),
    ('s6666666-6666-6666-6666-666666666666', 'emma.davis@university.edu', 'Emma Davis', 'student', '9876543215', true),
    ('s7777777-7777-7777-7777-777777777777', 'james.wilson@university.edu', 'James Wilson', 'student', '9876543216', true),
    ('s8888888-8888-8888-8888-888888888888', 'olivia.taylor@university.edu', 'Olivia Taylor', 'student', '9876543217', true)
ON CONFLICT (id) DO NOTHING;

-- Create student records
INSERT INTO students (id, student_id, course_id, batch_year, semester, admission_date, permanent_address, emergency_contacts) VALUES
    ('s1111111-1111-1111-1111-111111111111', 'STU001', 'c1111111-1111-1111-1111-111111111111', 2022, 5, '2022-07-15', 
     '{"address": "123 Main St, City, State", "city": "Mumbai", "pincode": "400001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543299", "relation": "Father"}}'),
    
    ('s2222222-2222-2222-2222-222222222222', 'STU002', 'c2222222-2222-2222-2222-222222222222', 2021, 7, '2021-07-15', 
     '{"address": "456 Oak Ave, City, State", "city": "Delhi", "pincode": "110001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543298", "relation": "Mother"}}'),
    
    ('s3333333-3333-3333-3333-333333333333', 'STU003', 'c3333333-3333-3333-3333-333333333333', 2023, 3, '2023-07-15', 
     '{"address": "789 Pine Rd, City, State", "city": "Bangalore", "pincode": "560001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543297", "relation": "Father"}}'),
    
    ('s4444444-4444-4444-4444-444444444444', 'STU004', 'c1111111-1111-1111-1111-111111111111', 2022, 5, '2022-07-15', 
     '{"address": "321 Elm St, City, State", "city": "Chennai", "pincode": "600001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543296", "relation": "Mother"}}'),
    
    ('s5555555-5555-5555-5555-555555555555', 'STU005', 'c4444444-4444-4444-4444-444444444444', 2023, 3, '2023-07-15', 
     '{"address": "654 Maple Dr, City, State", "city": "Pune", "pincode": "411001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543295", "relation": "Father"}}'),
    
    ('s6666666-6666-6666-6666-666666666666', 'STU006', 'c2222222-2222-2222-2222-222222222222', 2021, 7, '2021-07-15', 
     '{"address": "987 Cedar Ln, City, State", "city": "Hyderabad", "pincode": "500001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543294", "relation": "Mother"}}'),
    
    ('s7777777-7777-7777-7777-777777777777', 'STU007', 'c3333333-3333-3333-3333-333333333333', 2024, 1, '2024-07-15', 
     '{"address": "147 Birch Way, City, State", "city": "Kolkata", "pincode": "700001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543293", "relation": "Father"}}'),
    
    ('s8888888-8888-8888-8888-888888888888', 'STU008', 'c1111111-1111-1111-1111-111111111111', 2024, 1, '2024-07-15', 
     '{"address": "258 Spruce Ct, City, State", "city": "Ahmedabad", "pincode": "380001"}', 
     '{"primary": {"name": "Parent Name", "phone": "9876543292", "relation": "Mother"}}')
ON CONFLICT (id) DO NOTHING;

-- Create dummy faculty
INSERT INTO users (id, email, full_name, role, phone, is_active) VALUES
    ('f1111111-1111-1111-1111-111111111111', 'prof.kumar@university.edu', 'Prof. Rajesh Kumar', 'faculty', '9876543220', true),
    ('f2222222-2222-2222-2222-222222222222', 'dr.sharma@university.edu', 'Dr. Priya Sharma', 'faculty', '9876543221', true),
    ('f3333333-3333-3333-3333-333333333333', 'prof.patel@university.edu', 'Prof. Amit Patel', 'faculty', '9876543222', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO faculty (id, faculty_id, department_id, designation, qualification, specialization, join_date) VALUES
    ('f1111111-1111-1111-1111-111111111111', 'FAC001', 'd1111111-1111-1111-1111-111111111111', 'Professor',
     '{"degrees": ["PhD in Computer Science", "M.Tech in AI"], "university": ["IIT Delhi", "IIT Bombay"]}',
     ARRAY['Artificial Intelligence', 'Machine Learning'], '2015-08-01'),
    ('f2222222-2222-2222-2222-222222222222', 'FAC002', 'd1111111-1111-1111-1111-111111111111', 'Associate Professor',
     '{"degrees": ["PhD in Electronics", "M.Tech in VLSI"], "university": ["IIT Madras", "NIT Trichy"]}',
     ARRAY['Digital Signal Processing', 'VLSI Design'], '2018-07-15'),
    ('f3333333-3333-3333-3333-333333333333', 'FAC003', 'd1111111-1111-1111-1111-111111111111', 'Assistant Professor',
     '{"degrees": ["PhD in Mechanical Engineering", "M.Tech in Thermal"], "university": ["IIT Kanpur", "IIT Kharagpur"]}',
     ARRAY['Thermodynamics', 'Fluid Mechanics'], '2020-08-01')
ON CONFLICT (id) DO NOTHING;

-- Add library books
INSERT INTO library_books (id, title, authors, isbn, category, total_copies, available_copies, location, publication_year) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'Introduction to Algorithms', 
     ARRAY['Thomas H. Cormen', 'Charles E. Leiserson', 'Ronald L. Rivest'], 
     '978-0262033848', 'Computer Science', 5, 3, 'CS-101', 2009),
    
    ('b2222222-2222-2222-2222-222222222222', 'Digital Signal Processing', 
     ARRAY['John G. Proakis', 'Dimitris K. Manolakis'], 
     '978-0131873742', 'Electronics', 3, 2, 'EC-201', 2006),
    
    ('b3333333-3333-3333-3333-333333333333', 'Engineering Mechanics', 
     ARRAY['J.L. Meriam', 'L.G. Kraige'], 
     '978-1118164990', 'Mechanical', 4, 4, 'ME-301', 2012),
    
    ('b4444444-4444-4444-4444-444444444444', 'Structural Analysis', 
     ARRAY['R.C. Hibbeler'], 
     '978-0133942842', 'Civil', 3, 3, 'CE-401', 2018),
    
    ('b5555555-5555-5555-5555-555555555555', 'Database System Concepts', 
     ARRAY['Abraham Silberschatz', 'Henry F. Korth', 'S. Sudarshan'], 
     '978-0078022159', 'Computer Science', 6, 4, 'CS-102', 2019),
    
    ('b6666666-6666-6666-6666-666666666666', 'Computer Networks', 
     ARRAY['Andrew S. Tanenbaum', 'David J. Wetherall'], 
     '978-0132126953', 'Computer Science', 4, 2, 'CS-103', 2010),
    
    ('b7777777-7777-7777-7777-777777777777', 'Electronic Devices and Circuit Theory', 
     ARRAY['Robert L. Boylestad', 'Louis Nashelsky'], 
     '978-0134879482', 'Electronics', 5, 3, 'EC-202', 2019),
    
    ('b8888888-8888-8888-8888-888888888888', 'Thermodynamics: An Engineering Approach', 
     ARRAY['Yunus A. Cengel', 'Michael A. Boles'], 
     '978-0073398174', 'Mechanical', 4, 3, 'ME-302', 2014)
ON CONFLICT (id) DO NOTHING;

-- Add some library transactions
INSERT INTO library_transactions (id, book_id, student_id, issue_date, due_date, return_date, fine_amount, status) VALUES
    ('t1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 
     CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '4 days', NULL, 0, 'issued'),
    
    ('t2222222-2222-2222-2222-222222222222', 'b5555555-5555-5555-5555-555555555555', 's2222222-2222-2222-2222-222222222222', 
     CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days', NULL, 60, 'issued'),
    
    ('t3333333-3333-3333-3333-333333333333', 'b6666666-6666-6666-6666-666666666666', 's3333333-3333-3333-3333-333333333333', 
     CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '9 days', NULL, 0, 'issued'),
    
    ('t4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 's4444444-4444-4444-4444-444444444444', 
     CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE - INTERVAL '10 days', 0, 'returned')
ON CONFLICT (id) DO NOTHING;

-- Update available copies for issued books
UPDATE library_books SET available_copies = available_copies - 1 
WHERE id IN ('b1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', 'b6666666-6666-6666-6666-666666666666');

-- Add attendance records
INSERT INTO simple_attendance (id, student_id, course_id, date, status, marked_by, remarks) VALUES
    (gen_random_uuid(), 's1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE, 'present', 'f1111111-1111-1111-1111-111111111111', NULL),
    (gen_random_uuid(), 's2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', CURRENT_DATE, 'present', 'f2222222-2222-2222-2222-222222222222', NULL),
    (gen_random_uuid(), 's3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', CURRENT_DATE, 'absent', 'f3333333-3333-3333-3333-333333333333', 'Medical leave'),
    (gen_random_uuid(), 's4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE, 'present', 'f1111111-1111-1111-1111-111111111111', NULL),
    (gen_random_uuid(), 's5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', CURRENT_DATE, 'present', 'f3333333-3333-3333-3333-333333333333', NULL)
ON CONFLICT DO NOTHING;

-- Add some examinations
INSERT INTO examinations (id, name, course_id, exam_date, total_marks, duration_minutes, exam_type, instructions) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Data Structures Mid-Term', 'c1111111-1111-1111-1111-111111111111', 
     CURRENT_DATE + INTERVAL '7 days', 50, 90, 'midterm', 
     '{"general": "All questions are compulsory", "allowed": ["Calculator", "One A4 sheet"], "prohibited": ["Mobile phones", "Smart watches"]}'),
    
    ('e2222222-2222-2222-2222-222222222222', 'Digital Circuits Final Exam', 'c2222222-2222-2222-2222-222222222222', 
     CURRENT_DATE + INTERVAL '14 days', 100, 180, 'final', 
     '{"general": "Answer any 5 out of 7 questions", "allowed": ["Scientific Calculator"], "prohibited": ["Mobile phones", "Books"]}')
ON CONFLICT (id) DO NOTHING;

-- Add some fee records
INSERT INTO fees (id, student_id, amount, fee_type, due_date, status, payment_date, transaction_id, remarks) VALUES
    (gen_random_uuid(), 's1111111-1111-1111-1111-111111111111', 75000, 'tuition', CURRENT_DATE + INTERVAL '30 days', 'pending', NULL, NULL, 'Semester 5 fees'),
    (gen_random_uuid(), 's2222222-2222-2222-2222-222222222222', 75000, 'tuition', CURRENT_DATE - INTERVAL '10 days', 'paid', CURRENT_DATE - INTERVAL '5 days', 'TXN123456', 'Semester 7 fees'),
    (gen_random_uuid(), 's3333333-3333-3333-3333-333333333333', 75000, 'tuition', CURRENT_DATE + INTERVAL '30 days', 'pending', NULL, NULL, 'Semester 3 fees'),
    (gen_random_uuid(), 's1111111-1111-1111-1111-111111111111', 15000, 'hostel', CURRENT_DATE + INTERVAL '15 days', 'pending', NULL, NULL, 'Hostel fees for current semester'),
    (gen_random_uuid(), 's2222222-2222-2222-2222-222222222222', 15000, 'hostel', CURRENT_DATE - INTERVAL '20 days', 'paid', CURRENT_DATE - INTERVAL '18 days', 'TXN123457', 'Hostel fees paid');

-- Add hostel room allocations
INSERT INTO hostel_rooms (id, room_number, building, floor, capacity, current_occupancy, room_type, facilities, status) VALUES
    ('h1111111-1111-1111-1111-111111111111', 'A-101', 'Block A', 1, 2, 1, 'double', 
     '["Attached Bathroom", "Study Table", "Wardrobe", "WiFi"]', 'available'),
    ('h2222222-2222-2222-2222-222222222222', 'A-102', 'Block A', 1, 2, 2, 'double', 
     '["Attached Bathroom", "Study Table", "Wardrobe", "WiFi"]', 'occupied'),
    ('h3333333-3333-3333-3333-333333333333', 'B-201', 'Block B', 2, 3, 2, 'triple', 
     '["Common Bathroom", "Study Table", "Wardrobe", "WiFi"]', 'available'),
    ('h4444444-4444-4444-4444-444444444444', 'A-301', 'Block A', 3, 1, 1, 'single', 
     '["Attached Bathroom", "Study Table", "Wardrobe", "WiFi", "AC"]', 'occupied');

INSERT INTO room_allocations (id, room_id, student_id, bed_number, allocated_date, vacated_date, status) VALUES
    (gen_random_uuid(), 'h1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'Bed-1', CURRENT_DATE - INTERVAL '60 days', NULL, 'active'),
    (gen_random_uuid(), 'h2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'Bed-1', CURRENT_DATE - INTERVAL '90 days', NULL, 'active'),
    (gen_random_uuid(), 'h2222222-2222-2222-2222-222222222222', 's3333333-3333-3333-3333-333333333333', 'Bed-2', CURRENT_DATE - INTERVAL '30 days', NULL, 'active'),
    (gen_random_uuid(), 'h3333333-3333-3333-3333-333333333333', 's4444444-4444-4444-4444-444444444444', 'Bed-1', CURRENT_DATE - INTERVAL '45 days', NULL, 'active'),
    (gen_random_uuid(), 'h3333333-3333-3333-3333-333333333333', 's5555555-5555-5555-5555-555555555555', 'Bed-2', CURRENT_DATE - INTERVAL '45 days', NULL, 'active'),
    (gen_random_uuid(), 'h4444444-4444-4444-4444-444444444444', 's6666666-6666-6666-6666-666666666666', 'Bed-1', CURRENT_DATE - INTERVAL '120 days', NULL, 'active');

-- Add some out-pass requests
INSERT INTO out_pass (id, student_id, purpose, destination, out_date, out_time, expected_return_date, expected_return_time, actual_return_date, actual_return_time, status, approved_by, approved_date, guardian_contact, remarks) VALUES
    (gen_random_uuid(), 's1111111-1111-1111-1111-111111111111', 'Home Visit', 'Mumbai', 
     CURRENT_DATE + INTERVAL '2 days', '10:00:00', CURRENT_DATE + INTERVAL '4 days', '18:00:00', 
     NULL, NULL, 'pending', NULL, NULL, '9876543299', 'Weekend home visit'),
    
    (gen_random_uuid(), 's2222222-2222-2222-2222-222222222222', 'Medical Appointment', 'City Hospital', 
     CURRENT_DATE, '14:00:00', CURRENT_DATE, '18:00:00', 
     CURRENT_DATE, '17:30:00', 'completed', 'f1111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 hour', 
     '9876543298', 'Doctor appointment'),
    
    (gen_random_uuid(), 's3333333-3333-3333-3333-333333333333', 'Family Function', 'Bangalore', 
     CURRENT_DATE - INTERVAL '5 days', '08:00:00', CURRENT_DATE - INTERVAL '2 days', '20:00:00', 
     CURRENT_DATE - INTERVAL '2 days', '19:45:00', 'completed', 'f2222222-2222-2222-2222-222222222222', 
     CURRENT_DATE - INTERVAL '6 days', '9876543297', 'Sister wedding');

COMMIT;