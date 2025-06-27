'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Select,
  Alert,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import { IconAlertCircle } from '@tabler/icons-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  interface FormValues {
    email: string
    password: string
    confirmPassword: string
    fullName: string
    role: string
    phone: string
  }

  const form = useForm<FormValues>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'student',
      phone: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
      confirmPassword: (value: string, values: FormValues) =>
        value === values.password ? null : 'Passwords do not match',
      fullName: (value: string) =>
        value.trim().length >= 3 ? null : 'Name must be at least 3 characters',
      phone: (value: string) =>
        /^[0-9]{10}$/.test(value) ? null : 'Phone number must be 10 digits',
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    setError(null)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: values.role,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: values.email,
          full_name: values.fullName,
          role: values.role as any,
          phone: values.phone,
        })

        if (profileError) throw profileError

        notifications.show({
          title: 'Success',
          message: 'Registration successful! Please check your email to verify your account.',
          color: 'green',
        })

        router.push('/login')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to register',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper className="w-full max-w-md p-8 rounded-xl shadow-xl">
      <Stack gap="md">
        <div>
          <Title order={2} ta="center" mb={5}>
            Create Account
          </Title>
          <Text color="dimmed" size="sm" ta="center">
            Register for University Hub
          </Text>
        </div>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              {...form.getInputProps('fullName')}
            />
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Phone Number"
              placeholder="9876543210"
              required
              {...form.getInputProps('phone')}
            />
            <Select
              label="Role"
              placeholder="Select your role"
              data={[
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' },
                { value: 'parent', label: 'Parent' },
              ]}
              required
              {...form.getInputProps('role')}
            />
            <PasswordInput
              label="Password"
              placeholder="Create a password"
              required
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              {...form.getInputProps('confirmPassword')}
            />

            <Text size="sm" mt="xs">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:underline">
                Login
              </Link>
            </Text>

            <Button type="submit" fullWidth loading={loading} mt="xl">
              Create Account
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  )
}
