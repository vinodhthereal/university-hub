export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'admin' | 'faculty' | 'student' | 'parent' | 'staff'
          department_id: string | null
          phone: string | null
          alternate_phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          nationality: string
          is_active: boolean
          last_login: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'admin' | 'faculty' | 'student' | 'parent' | 'staff'
          department_id?: string | null
          phone?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          nationality?: string
          is_active?: boolean
          last_login?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'super_admin' | 'admin' | 'faculty' | 'student' | 'parent' | 'staff'
          department_id?: string | null
          phone?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          nationality?: string
          is_active?: boolean
          last_login?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          course_id: string | null
          batch_year: number
          semester: number
          section: string | null
          roll_number: string | null
          admission_date: string
          admission_type: 'regular' | 'lateral' | 'transfer' | null
          admission_category: string | null
          parent_id: string | null
          guardian_info: Json | null
          permanent_address: Json
          current_address: Json | null
          blood_group: string | null
          medical_info: Json | null
          emergency_contacts: Json
          previous_education: Json | null
          documents: Json | null
          is_hosteller: boolean
          transport_opted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          student_id: string
          course_id?: string | null
          batch_year: number
          semester?: number
          section?: string | null
          roll_number?: string | null
          admission_date: string
          admission_type?: 'regular' | 'lateral' | 'transfer' | null
          admission_category?: string | null
          parent_id?: string | null
          guardian_info?: Json | null
          permanent_address: Json
          current_address?: Json | null
          blood_group?: string | null
          medical_info?: Json | null
          emergency_contacts: Json
          previous_education?: Json | null
          documents?: Json | null
          is_hosteller?: boolean
          transport_opted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string | null
          batch_year?: number
          semester?: number
          section?: string | null
          roll_number?: string | null
          admission_date?: string
          admission_type?: 'regular' | 'lateral' | 'transfer' | null
          admission_category?: string | null
          parent_id?: string | null
          guardian_info?: Json | null
          permanent_address?: Json
          current_address?: Json | null
          blood_group?: string | null
          medical_info?: Json | null
          emergency_contacts?: Json
          previous_education?: Json | null
          documents?: Json | null
          is_hosteller?: boolean
          transport_opted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          university_id: string | null
          name: string
          code: string
          head_id: string | null
          description: string | null
          established_date: string | null
          contact_info: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          university_id?: string | null
          name: string
          code: string
          head_id?: string | null
          description?: string | null
          established_date?: string | null
          contact_info?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          university_id?: string | null
          name?: string
          code?: string
          head_id?: string | null
          description?: string | null
          established_date?: string | null
          contact_info?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          department_id: string
          name: string
          code: string
          degree_type: 'bachelor' | 'master' | 'diploma' | 'certificate' | 'phd' | null
          duration_years: number
          total_credits: number
          min_credits_required: number
          max_intake: number | null
          eligibility_criteria: Json | null
          syllabus_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          department_id: string
          name: string
          code: string
          degree_type?: 'bachelor' | 'master' | 'diploma' | 'certificate' | 'phd' | null
          duration_years: number
          total_credits: number
          min_credits_required: number
          max_intake?: number | null
          eligibility_criteria?: Json | null
          syllabus_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          name?: string
          code?: string
          degree_type?: 'bachelor' | 'master' | 'diploma' | 'certificate' | 'phd' | null
          duration_years?: number
          total_credits?: number
          min_credits_required?: number
          max_intake?: number | null
          eligibility_criteria?: Json | null
          syllabus_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          session_id: string
          student_id: string
          status: 'present' | 'absent' | 'late' | 'excused' | 'holiday'
          check_in_time: string | null
          check_out_time: string | null
          marked_by: string | null
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          status: 'present' | 'absent' | 'late' | 'excused' | 'holiday'
          check_in_time?: string | null
          check_out_time?: string | null
          marked_by?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          status?: 'present' | 'absent' | 'late' | 'excused' | 'holiday'
          check_in_time?: string | null
          check_out_time?: string | null
          marked_by?: string | null
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      fee_payments: {
        Row: {
          id: string
          student_id: string
          fee_structure_id: string | null
          amount_due: number
          amount_paid: number
          late_fee: number
          payment_date: string
          payment_mode: 'online' | 'cash' | 'cheque' | 'dd' | 'bank_transfer' | null
          transaction_id: string | null
          receipt_number: string | null
          status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial' | null
          remarks: string | null
          processed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          fee_structure_id?: string | null
          amount_due: number
          amount_paid: number
          late_fee?: number
          payment_date: string
          payment_mode?: 'online' | 'cash' | 'cheque' | 'dd' | 'bank_transfer' | null
          transaction_id?: string | null
          receipt_number?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial' | null
          remarks?: string | null
          processed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          fee_structure_id?: string | null
          amount_due?: number
          amount_paid?: number
          late_fee?: number
          payment_date?: string
          payment_mode?: 'online' | 'cash' | 'cheque' | 'dd' | 'bank_transfer' | null
          transaction_id?: string | null
          receipt_number?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial' | null
          remarks?: string | null
          processed_by?: string | null
          created_at?: string
        }
      }
      outpass_requests: {
        Row: {
          id: string
          student_id: string
          outpass_type_id: string | null
          purpose: string
          destination: string
          from_datetime: string
          to_datetime: string
          contact_during_leave: string
          accompanied_by: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
          warden_approval_status: 'pending' | 'approved' | 'rejected' | null
          warden_approved_by: string | null
          warden_approval_date: string | null
          hod_approval_status: 'pending' | 'approved' | 'rejected' | null
          hod_approved_by: string | null
          hod_approval_date: string | null
          parent_notified: boolean
          parent_notified_at: string | null
          actual_out_time: string | null
          actual_in_time: string | null
          late_return_reason: string | null
          remarks: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          outpass_type_id?: string | null
          purpose: string
          destination: string
          from_datetime: string
          to_datetime: string
          contact_during_leave: string
          accompanied_by?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
          warden_approval_status?: 'pending' | 'approved' | 'rejected' | null
          warden_approved_by?: string | null
          warden_approval_date?: string | null
          hod_approval_status?: 'pending' | 'approved' | 'rejected' | null
          hod_approved_by?: string | null
          hod_approval_date?: string | null
          parent_notified?: boolean
          parent_notified_at?: string | null
          actual_out_time?: string | null
          actual_in_time?: string | null
          late_return_reason?: string | null
          remarks?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          outpass_type_id?: string | null
          purpose?: string
          destination?: string
          from_datetime?: string
          to_datetime?: string
          contact_during_leave?: string
          accompanied_by?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired'
          warden_approval_status?: 'pending' | 'approved' | 'rejected' | null
          warden_approved_by?: string | null
          warden_approval_date?: string | null
          hod_approval_status?: 'pending' | 'approved' | 'rejected' | null
          hod_approved_by?: string | null
          hod_approval_date?: string | null
          parent_notified?: boolean
          parent_notified_at?: string | null
          actual_out_time?: string | null
          actual_in_time?: string | null
          late_return_reason?: string | null
          remarks?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
