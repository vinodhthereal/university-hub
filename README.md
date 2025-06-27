# University Hub - Complete Campus Management System

A modern, full-featured university management system built with Next.js 14, TypeScript, Mantine UI, Tailwind CSS, and Supabase.

## Features

- **User Management**: Multi-role support (Admin, Faculty, Student, Parent, Staff)
- **Student Registration**: Complete admission and enrollment management
- **Attendance System**: Digital attendance tracking with analytics
- **Examination Management**: Exam scheduling, marks entry, and result publication
- **Fee Management**: Online fee collection and payment tracking
- **Out-Pass System**: Digital out-pass requests with approval workflow
- **Hostel Management**: Room allocation and hostel administration
- **Library System**: Book issue/return management
- **Analytics Dashboard**: Real-time insights and reporting

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **UI Library**: Mantine UI v7
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Git

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd university-hub
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up Supabase**

- Create a new Supabase project
- Go to SQL Editor and run the database schema from `DATABASE_SCHEMA.md`
- Enable Email authentication in Supabase Auth settings
- Configure Row Level Security (RLS) policies as needed

5. **Run the development server**

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
university-hub/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
├── lib/                     # Utilities and configurations
│   ├── supabase/           # Supabase client setup
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── validations/        # Zod schemas
├── types/                   # TypeScript type definitions
└── public/                  # Static assets
```

## Default Credentials

For testing purposes, you can create users with these roles:

- **Admin**: Full system access
- **Faculty**: Teaching and grading functions
- **Student**: Personal academic access
- **Parent**: Limited access to ward's information

## Key Features Implementation

### Authentication

- Supabase Auth with email/password
- Role-based access control
- Protected routes with middleware

### Real-time Features

- Live attendance updates
- Real-time notifications
- Instant out-pass status updates

### File Uploads

- Student documents
- Profile pictures
- Assignment submissions

## Development

### Code Style

- ESLint configuration included
- Prettier for code formatting
- TypeScript strict mode enabled

### Testing

```bash
npm run test
npm run test:watch
```

### Building for Production

```bash
npm run build
npm run start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t university-hub .
docker run -p 3000:3000 university-hub
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Student Management

- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- All API routes are protected with authentication
- Row Level Security (RLS) enabled on all tables
- Input validation with Zod
- CSRF protection enabled
- Environment variables for sensitive data

## Performance Optimization

- Image optimization with Next.js Image component
- Lazy loading for heavy components
- API route caching
- Database indexing for fast queries
- Incremental Static Regeneration (ISR)

## Support

For support, email support@universityhub.com or join our Slack channel.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
