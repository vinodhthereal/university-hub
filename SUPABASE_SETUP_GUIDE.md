# Supabase Setup Guide for University Hub

This guide will walk you through creating and configuring a Supabase project for the University Hub application.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click on **"Start your project"** button
3. Sign up using:
   - GitHub (recommended for developers)
   - Or email/password

## Step 2: Create a New Project

1. After signing in, click **"New project"**
2. Fill in the project details:
   - **Organization**: Select your organization or create a new one
   - **Project name**: `university-hub` (or any name you prefer)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the closest region to your location for better performance
   - **Pricing Plan**: Free tier is sufficient for development

3. Click **"Create new project"**
4. Wait for the project to be provisioned (takes about 2 minutes)

## Step 3: Get Your Project Credentials

Once your project is ready:

1. Go to **Settings** (gear icon in the sidebar)
2. Click on **API** in the settings menu
3. You'll find:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

4. Copy these values to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

## Step 4: Set Up the Database Schema

### Option A: Using SQL Editor (Recommended)

1. In your Supabase dashboard, click on **SQL Editor** in the sidebar
2. Click **"New query"**
3. Copy the entire SQL schema from the `DATABASE_SCHEMA.md` file in your project
4. Paste it into the SQL editor
5. Click **"Run"** or press `Cmd/Ctrl + Enter`

### Option B: Step-by-Step Table Creation

If you prefer to create tables one by one:

1. Go to **Table Editor** in the sidebar
2. Click **"Create a new table"**
3. Start with these core tables in order:

#### 1. Universities Table (if multi-tenant)

```sql
CREATE TABLE universities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address JSONB NOT NULL,
  contact_info JSONB NOT NULL,
  logo_url TEXT,
  website TEXT,
  established_date DATE,
  accreditation JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Departments Table

```sql
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  head_id UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  established_date DATE,
  contact_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id, code)
);
```

#### 3. Users Table (extends auth.users)

```sql
CREATE TABLE public.users (
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
```

## Step 5: Enable Authentication

1. Go to **Authentication** in the sidebar
2. Click on **Providers**
3. Enable **Email** provider:
   - Toggle "Enable Email Provider"
   - Configure email settings:
     - Enable "Confirm email" for production
     - Customize email templates if needed

## Step 6: Set Up Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. For each table, enable RLS:
   - Click on the table name
   - Toggle "Enable RLS"
   - Add policies for different operations

### Example RLS Policies for Users Table:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

## Step 7: Set Up Storage (Optional)

For file uploads (profile pictures, documents):

1. Go to **Storage** in the sidebar
2. Click **"Create bucket"**
3. Create buckets for:
   - `avatars` - for profile pictures
   - `documents` - for student documents
   - `assignments` - for assignment submissions

4. Set bucket policies:

```sql
-- Example: Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Step 8: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirmation email
   - Password reset
   - Magic link

## Step 9: Test Your Connection

1. In your project directory, create a test file `test-connection.js`:

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count')

    if (error) throw error
    console.log('Connection successful!')
  } catch (error) {
    console.error('Connection failed:', error.message)
  }
}

testConnection()
```

2. Run: `node test-connection.js`

## Step 10: Create Initial Admin User

1. In SQL Editor, run:

```sql
-- First create an auth user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@university.edu',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Then create the user profile
INSERT INTO public.users (id, email, full_name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@university.edu'),
  'admin@university.edu',
  'System Administrator',
  'super_admin',
  true
);
```

## Common Issues and Solutions

### 1. CORS Errors

- Make sure your site URL is added in **Authentication** → **URL Configuration**
- Add `http://localhost:3000` to allowed URLs

### 2. Permission Denied Errors

- Check if RLS is enabled without policies
- Verify your service role key is correct
- Check if the user has the right role

### 3. Connection Timeouts

- Check if you selected the right region
- Verify your internet connection
- Try using a different DNS

## Security Best Practices

1. **Never expose** your service role key in client-side code
2. **Always use** environment variables for sensitive data
3. **Enable RLS** on all tables
4. **Implement proper** authentication checks
5. **Regular backups** - Supabase provides daily backups on paid plans

## Next Steps

1. Update your `.env.local` file with the credentials
2. Run `npm run dev` to start your application
3. Visit `http://localhost:3000` to see your app
4. Create your first user account
5. Start exploring the University Hub features!

## Useful Supabase Features

- **Realtime**: Subscribe to database changes
- **Edge Functions**: Run server-side code
- **Vector embeddings**: For AI/ML features
- **Database webhooks**: Trigger external services
- **Point-in-time recovery**: Restore to any point (paid plans)

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Video Tutorials](https://www.youtube.com/c/Supabase)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
