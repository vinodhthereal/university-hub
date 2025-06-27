import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  
  const course = searchParams.get('course')
  const semester = searchParams.get('semester')
  const search = searchParams.get('search')
  
  try {
    let query = supabase
      .from('students')
      .select(`
        *,
        users!inner(
          full_name,
          email,
          phone,
          is_active
        ),
        courses(
          name,
          code
        )
      `)
    
    if (course) {
      query = query.eq('course_id', course)
    }
    
    if (semester) {
      query = query.eq('semester', semester)
    }
    
    if (search) {
      query = query.or(`student_id.ilike.%${search}%,users.full_name.ilike.%${search}%`)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ students: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  
  try {
    const body = await request.json()
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    })
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    // Create user profile
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: body.email,
        full_name: body.full_name,
        role: 'student',
        phone: body.phone,
        department_id: body.department_id,
      })
    
    if (userError) {
      // Cleanup auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }
    
    // Create student record
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .insert({
        id: authData.user.id,
        student_id: body.student_id,
        course_id: body.course_id,
        batch_year: body.batch_year,
        semester: body.semester || 1,
        admission_date: body.admission_date,
        permanent_address: body.permanent_address,
        emergency_contacts: body.emergency_contacts,
      })
      .select()
      .single()
    
    if (studentError) {
      // Cleanup if student creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: studentError.message }, { status: 400 })
    }
    
    return NextResponse.json({ student: studentData }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}