-- Create simplified tables for missing features
-- This creates simpler versions of complex tables for the MVP

-- Simple attendance table (without complex session management)
CREATE TABLE IF NOT EXISTS simple_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id, date)
);

-- Create an alias view for compatibility
CREATE OR REPLACE VIEW attendance AS 
SELECT 
  id,
  student_id,
  course_id,
  date,
  status,
  marked_by,
  remarks,
  created_at
FROM simple_attendance;

-- Simple examinations table
CREATE TABLE IF NOT EXISTS examinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  total_marks INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  exam_type TEXT CHECK (exam_type IN ('midterm', 'final', 'quiz', 'assignment')),
  instructions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simple fees table
CREATE TABLE IF NOT EXISTS fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  fee_type TEXT CHECK (fee_type IN ('tuition', 'hostel', 'transport', 'library', 'exam', 'other')),
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'waived')) DEFAULT 'pending',
  payment_date DATE,
  transaction_id TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hostel rooms table
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  building TEXT NOT NULL,
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'dormitory')),
  facilities JSONB,
  status TEXT CHECK (status IN ('available', 'occupied', 'maintenance')) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_occupancy CHECK (current_occupancy <= capacity AND current_occupancy >= 0)
);

-- Room allocations
CREATE TABLE IF NOT EXISTS room_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  bed_number TEXT NOT NULL,
  allocated_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vacated_date DATE,
  status TEXT CHECK (status IN ('active', 'vacated')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, status) -- One active allocation per student
);

-- Out pass requests
CREATE TABLE IF NOT EXISTS out_pass (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  destination TEXT NOT NULL,
  out_date DATE NOT NULL,
  out_time TIME NOT NULL,
  expected_return_date DATE NOT NULL,
  expected_return_time TIME NOT NULL,
  actual_return_date DATE,
  actual_return_time TIME,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approved_date TIMESTAMPTZ,
  guardian_contact TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (expected_return_date >= out_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_simple_attendance_student ON simple_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_simple_attendance_date ON simple_attendance(date);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_out_pass_student ON out_pass(student_id);
CREATE INDEX IF NOT EXISTS idx_out_pass_status ON out_pass(status);

-- Enable RLS
ALTER TABLE simple_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE out_pass ENABLE ROW LEVEL SECURITY;

-- Simple attendance policies
CREATE POLICY "Students can view own attendance" ON simple_attendance
    FOR SELECT USING (student_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'faculty')));

CREATE POLICY "Faculty can manage attendance" ON simple_attendance
    FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'faculty')));

-- Fees policies
CREATE POLICY "Students can view own fees" ON fees
    FOR SELECT USING (student_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'faculty')));

CREATE POLICY "Admin can manage fees" ON fees
    FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Out pass policies
CREATE POLICY "Students can view own out passes" ON out_pass
    FOR SELECT USING (student_id = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'faculty')));

CREATE POLICY "Students can create out pass requests" ON out_pass
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can manage out passes" ON out_pass
    FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'faculty')));