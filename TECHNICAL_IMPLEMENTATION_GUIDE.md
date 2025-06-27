# University Hub - Technical Implementation Guide

## Technology Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Library**: Mantine UI v7+
- **State Management**: Zustand / TanStack Query
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts / Chart.js

### Backend & Database

- **Primary Option**: Supabase
  - PostgreSQL database
  - Real-time subscriptions
  - Built-in authentication
  - Row Level Security (RLS)
  - Storage for files
  - Edge Functions

- **Alternative**: Firebase
  - Firestore for database
  - Firebase Auth
  - Cloud Storage
  - Cloud Functions
  - Real-time updates

### Development Tools

- **Language**: TypeScript
- **Package Manager**: pnpm / npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright

## Project Structure

```
university-hub/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Protected routes
│   │   ├── layout.tsx       # Dashboard layout
│   │   ├── page.tsx         # Dashboard home
│   │   ├── students/
│   │   ├── faculty/
│   │   ├── courses/
│   │   ├── attendance/
│   │   ├── examinations/
│   │   ├── fees/
│   │   ├── outpass/
│   │   ├── hostel/
│   │   ├── library/
│   │   └── analytics/
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── charts/              # Chart components
│   └── layouts/             # Layout components
├── lib/
│   ├── supabase/           # Supabase client & utilities
│   ├── utils/              # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── validations/        # Zod schemas
├── styles/
│   └── globals.css         # Global styles
├── types/                   # TypeScript types
├── public/                  # Static assets
└── config/                  # Configuration files
```

## Database Schema (Supabase)

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'faculty', 'student', 'parent', 'staff')),
  department_id UUID REFERENCES departments(id),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  head_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  credits INTEGER NOT NULL,
  duration_years INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID REFERENCES users(id) PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  course_id UUID REFERENCES courses(id),
  batch_year INTEGER NOT NULL,
  admission_date DATE NOT NULL,
  parent_id UUID REFERENCES users(id),
  address JSONB,
  blood_group TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty
CREATE TABLE faculty (
  id UUID REFERENCES users(id) PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  designation TEXT NOT NULL,
  qualification TEXT[],
  specialization TEXT[],
  join_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  course_id UUID REFERENCES courses(id),
  semester INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  type TEXT CHECK (type IN ('theory', 'practical', 'elective')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES faculty(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, date)
);

-- Examinations
CREATE TABLE examinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('internal', 'semester', 'supplementary')),
  course_id UUID REFERENCES courses(id),
  semester INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  examination_id UUID REFERENCES examinations(id),
  subject_id UUID REFERENCES subjects(id),
  marks_obtained DECIMAL(5,2),
  max_marks DECIMAL(5,2),
  grade TEXT,
  status TEXT CHECK (status IN ('pass', 'fail', 'absent', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, examination_id, subject_id)
);

-- Fees
CREATE TABLE fee_structure (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  academic_year INTEGER NOT NULL,
  semester INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  components JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Payments
CREATE TABLE fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  fee_structure_id UUID REFERENCES fee_structure(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Out Pass
CREATE TABLE outpass_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  reason TEXT NOT NULL,
  from_datetime TIMESTAMPTZ NOT NULL,
  to_datetime TIMESTAMPTZ NOT NULL,
  destination TEXT NOT NULL,
  contact_during_leave TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hostel
CREATE TABLE hostel_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building TEXT NOT NULL,
  floor INTEGER NOT NULL,
  room_number TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER DEFAULT 0,
  room_type TEXT CHECK (room_type IN ('single', 'double', 'triple', 'dormitory')),
  amenities JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room Allocations
CREATE TABLE room_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  room_id UUID REFERENCES hostel_rooms(id),
  allocated_date DATE NOT NULL,
  vacated_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)

-- Example policies for students table
CREATE POLICY "Students can view their own data" ON students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Faculty can view students in their department" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN courses c ON c.department_id = u.department_id
      WHERE u.id = auth.uid()
      AND u.role = 'faculty'
      AND students.course_id = c.id
    )
  );
```

## Implementation Steps

### 1. Project Setup

```bash
# Create Next.js project
npx create-next-app@latest university-hub --typescript --tailwind --app

# Navigate to project
cd university-hub

# Install dependencies
npm install @mantine/core @mantine/hooks @mantine/dates @mantine/charts @mantine/form @mantine/notifications
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns
npm install -D @types/node
```

### 2. Environment Configuration

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For file uploads
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=university-hub-storage
```

### 3. Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 4. Mantine Provider Setup

```typescript
// app/providers.tsx
'use client'

import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  )
}
```

### 5. Authentication Setup

```typescript
// app/(auth)/login/page.tsx
'use client'

import { TextInput, PasswordInput, Button, Paper, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (!error) {
      router.push('/dashboard')
    }
  }

  return (
    <Paper className="max-w-md mx-auto mt-20 p-8">
      <Title order={2} className="text-center mb-6">
        University Hub Login
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Button type="submit" fullWidth mt="xl">
          Sign in
        </Button>
      </form>
    </Paper>
  )
}
```

### 6. Dashboard Layout

```typescript
// app/(dashboard)/layout.tsx
import { AppShell, Burger, Group, NavLink } from '@mantine/core'
import Link from 'next/link'

const navigation = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Students', href: '/dashboard/students' },
  { label: 'Faculty', href: '/dashboard/faculty' },
  { label: 'Courses', href: '/dashboard/courses' },
  { label: 'Attendance', href: '/dashboard/attendance' },
  { label: 'Examinations', href: '/dashboard/examinations' },
  { label: 'Fees', href: '/dashboard/fees' },
  { label: 'Out Pass', href: '/dashboard/outpass' },
  { label: 'Hostel', href: '/dashboard/hostel' },
  { label: 'Library', href: '/dashboard/library' },
  { label: 'Analytics', href: '/dashboard/analytics' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger hiddenFrom="sm" size="sm" />
          <h1 className="text-xl font-bold">University Hub</h1>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {navigation.map((item) => (
          <NavLink
            key={item.href}
            component={Link}
            href={item.href}
            label={item.label}
            className="mb-2"
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
```

## Key Features Implementation

### 1. Real-time Attendance

```typescript
// hooks/useAttendance.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeAttendance(subjectId: string, date: string) {
  const [attendance, setAttendance] = useState([])
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `subject_id=eq.${subjectId},date=eq.${date}`,
        },
        (payload) => {
          // Handle real-time updates
          console.log('Attendance update:', payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [subjectId, date])

  return attendance
}
```

### 2. File Upload (Documents, Photos)

```typescript
// utils/upload.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadFile(file: File, path: string) {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from('university-hub-storage').upload(path, file)

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('university-hub-storage').getPublicUrl(path)

  return publicUrl
}
```

### 3. Role-based Navigation

```typescript
// components/Navigation.tsx
import { useUser } from '@/hooks/useUser'

export function Navigation() {
  const { user, role } = useUser()

  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Dashboard', href: '/dashboard' },
    ]

    switch (role) {
      case 'admin':
      case 'super_admin':
        return [...baseItems,
          { label: 'Students', href: '/dashboard/students' },
          { label: 'Faculty', href: '/dashboard/faculty' },
          { label: 'Analytics', href: '/dashboard/analytics' },
          // ... all items
        ]
      case 'faculty':
        return [...baseItems,
          { label: 'My Classes', href: '/dashboard/classes' },
          { label: 'Attendance', href: '/dashboard/attendance' },
          { label: 'Examinations', href: '/dashboard/examinations' },
        ]
      case 'student':
        return [...baseItems,
          { label: 'My Courses', href: '/dashboard/my-courses' },
          { label: 'Attendance', href: '/dashboard/my-attendance' },
          { label: 'Results', href: '/dashboard/my-results' },
          { label: 'Fees', href: '/dashboard/my-fees' },
          { label: 'Out Pass', href: '/dashboard/outpass' },
        ]
      default:
        return baseItems
    }
  }

  return (
    <nav>
      {getNavigationItems().map(item => (
        // Render navigation items
      ))}
    </nav>
  )
}
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## Performance Optimization

### 1. Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 2. API Route Caching

```typescript
// app/api/students/route.ts
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET() {
  // Fetch students data
}
```

### 3. Lazy Loading

```typescript
// Dynamic imports for heavy components
const Analytics = dynamic(() => import('@/components/Analytics'), {
  loading: () => <Skeleton height={400} />,
})
```

## Security Best Practices

1. **Environment Variables**: Never commit sensitive keys
2. **RLS Policies**: Implement strict row-level security
3. **Input Validation**: Use Zod for all user inputs
4. **CSRF Protection**: Enabled by default in Next.js
5. **Content Security Policy**: Configure in next.config.js
6. **Rate Limiting**: Implement using Supabase Edge Functions

This implementation guide provides a solid foundation for building the University Hub with modern technologies and best practices.
